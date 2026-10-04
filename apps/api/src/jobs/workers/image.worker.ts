import { Job } from 'bullmq';
import { imageService } from '../../services/image.service';
import { storageService } from '../../services/storage.service';
import { MediaModel } from '../../models/Media';
import { PropertyModel } from '../../models/Property';
import { logger } from '../../utils/logger';
import path from 'path';
import crypto from 'crypto';

export interface ImageJobData {
  type: 'process_property_image' | 'generate_thumbnail';
  propertyId: string;
  bufferBase64: string;
  originalName: string;
  mimeType: string;
  uploadedBy: string;
  sortOrder?: number;
}

export async function processImageJob(job: Job<ImageJobData>): Promise<any> {
  const { data } = job;
  logger.info({ jobId: job.id, type: data.type, propertyId: data.propertyId }, 'Processing image job');

  try {
    const buffer = Buffer.from(data.bufferBase64, 'base64');
    const processed = await imageService.processImage(buffer);
    const ext = path.extname(data.originalName) || '.jpg';
    const baseKey = `properties/${data.propertyId}/${crypto.randomBytes(16).toString('hex')}`;

    const [originalUrl, webUrl, thumbnailUrl] = await Promise.all([
      storageService.uploadBuffer(processed.originalBuffer, `${baseKey}_original${ext}`, data.mimeType, true),
      storageService.uploadBuffer(processed.webBuffer, `${baseKey}_web.webp`, 'image/webp', true),
      storageService.uploadBuffer(processed.thumbBuffer, `${baseKey}_thumb.webp`, 'image/webp', true),
    ]);

    const media = new MediaModel({
      property: data.propertyId,
      type: 'image',
      originalUrl,
      webUrl,
      thumbnailUrl,
      fileName: data.originalName,
      fileSize: buffer.length,
      mimeType: data.mimeType,
      sortOrder: data.sortOrder ?? 0,
      uploadedBy: data.uploadedBy,
    });

    await media.save();

    // Update Property image count
    const property = await PropertyModel.findById(data.propertyId);
    if (property) {
      const allCount = await MediaModel.countDocuments({ property: data.propertyId, type: 'image' });
      property.imageCount = allCount;
      if (!property.coverImage) {
        media.isCover = true;
        await media.save();
        property.coverImage = thumbnailUrl;
      }
      await property.save();
    }

    return { success: true, mediaId: media._id, thumbnailUrl, webUrl };
  } catch (error: any) {
    logger.error({ jobId: job.id, err: error }, 'Failed to process image job');
    throw error;
  }
}
