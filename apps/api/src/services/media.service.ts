import { storageService } from './storage.service';
import { imageService } from './image.service';
import { MediaModel } from '../models/Media';
import { PropertyModel } from '../models/Property';
import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';

export class MediaService {
  public async uploadPropertyImages(propertyId: string, files: Express.Multer.File[], uploadedBy: string) {
    const results = [];
    
    // Determine current highest sortOrder
    const lastMedia = await MediaModel.findOne({ property: propertyId }).sort('-sortOrder');
    let currentSortOrder = lastMedia ? lastMedia.sortOrder + 1 : 0;

    for (const file of files) {
      const ext = path.extname(file.originalname) || '';
      const baseKey = `properties/${propertyId}/${crypto.randomBytes(16).toString('hex')}`;

      if (file.mimetype.startsWith('image/')) {
        const processed = await imageService.processImage(file.buffer);
        const imageExt = ext || '.jpg';
        
        const [originalUrl, webUrl, thumbnailUrl] = await Promise.all([
          storageService.uploadBuffer(processed.originalBuffer, `${baseKey}_original${imageExt}`, file.mimetype, true),
          storageService.uploadBuffer(processed.webBuffer, `${baseKey}_web.webp`, 'image/webp', true),
          storageService.uploadBuffer(processed.thumbBuffer, `${baseKey}_thumb.webp`, 'image/webp', true),
        ]);

        const media = new MediaModel({
          property: propertyId,
          type: 'image',
          originalUrl,
          webUrl,
          thumbnailUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          sortOrder: currentSortOrder++,
          uploadedBy
        });

        await media.save();
        results.push(media);
      } else if (file.mimetype.startsWith('video/') || ['.mp4', '.webm', '.mov', '.m4v'].includes(ext.toLowerCase())) {
        const videoExt = ext || '.mp4';
        const fileUrl = await storageService.uploadBuffer(file.buffer, `${baseKey}_video${videoExt}`, file.mimetype || 'video/mp4', true);

        const media = new MediaModel({
          property: propertyId,
          type: 'video',
          originalUrl: fileUrl,
          webUrl: fileUrl,
          thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype || 'video/mp4',
          sortOrder: currentSortOrder++,
          uploadedBy
        });

        await media.save();
        results.push(media);

        // Also update videoUrl on Property if not set
        await PropertyModel.findByIdAndUpdate(propertyId, { $set: { videoUrl: fileUrl } });
      } else if (file.mimetype === 'application/pdf' || ext.toLowerCase() === '.pdf') {
        const fileUrl = await storageService.uploadBuffer(file.buffer, `${baseKey}_doc.pdf`, 'application/pdf', true);

        const media = new MediaModel({
          property: propertyId,
          type: 'document',
          originalUrl: fileUrl,
          webUrl: fileUrl,
          thumbnailUrl: fileUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: 'application/pdf',
          sortOrder: currentSortOrder++,
          uploadedBy
        });

        await media.save();
        results.push(media);
      }
    }

    // Update Property model image count and set cover image if it isn't set
    const property = await PropertyModel.findById(propertyId);
    if (property) {
      const allMediaCount = await MediaModel.countDocuments({ property: propertyId, type: 'image' });
      property.imageCount = allMediaCount;
      
      if (!property.coverImage && results.length > 0) {
        const firstImage = results.find(m => m.type === 'image');
        if (firstImage) {
          firstImage.isCover = true;
          await firstImage.save();
          property.coverImage = firstImage.thumbnailUrl;
        }
      }
      
      await property.save();
    }

    return results;
  }

  public async addEmbedMedia(propertyId: string, payload: { url: string; type?: string; title?: string; uploadedBy?: string }) {
    const lastMedia = await MediaModel.findOne({ property: propertyId }).sort('-sortOrder');
    const sortOrder = lastMedia ? lastMedia.sortOrder + 1 : 0;

    const isTour = payload.type === 'virtual_tour' || payload.url.includes('matterport') || payload.url.includes('kuula');
    const mediaType = isTour ? 'virtual_tour' : 'video';

    const media = new MediaModel({
      property: propertyId,
      type: mediaType,
      originalUrl: payload.url,
      webUrl: payload.url,
      thumbnailUrl: isTour 
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      fileName: payload.title || (isTour ? '3D Virtual Walkthrough' : 'Video Tour'),
      fileSize: 0,
      mimeType: isTour ? 'application/x-virtual-tour' : 'video/embed',
      sortOrder,
      uploadedBy: payload.uploadedBy ? new mongoose.Types.ObjectId(payload.uploadedBy) : undefined,
    });

    await media.save();

    if (isTour) {
      await PropertyModel.findByIdAndUpdate(propertyId, { virtualTourUrl: payload.url });
    } else {
      await PropertyModel.findByIdAndUpdate(propertyId, { videoUrl: payload.url });
    }

    return media;
  }

  public async getPropertyMedia(propertyId: string) {
    return MediaModel.find({ property: propertyId }).sort({ sortOrder: 1 }).exec();
  }

  public async setCoverImage(mediaId: string, propertyId: string) {
    const targetMedia = await MediaModel.findOne({ _id: mediaId, property: propertyId });
    if (!targetMedia) {
      throw new Error('Media not found');
    }

    // Remove cover flag from all other media for this property
    await MediaModel.updateMany(
      { property: propertyId, _id: { $ne: mediaId } },
      { $set: { isCover: false } }
    );

    targetMedia.isCover = true;
    await targetMedia.save();

    await PropertyModel.findByIdAndUpdate(propertyId, {
      coverImage: targetMedia.thumbnailUrl
    });

    return targetMedia;
  }

  public async reorderMedia(propertyId: string, items: { id: string; sortOrder: number }[]) {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id, property: propertyId },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (bulkOps.length > 0) {
      await MediaModel.bulkWrite(bulkOps);
    }
  }

  public async deleteMedia(mediaId: string) {
    const media = await MediaModel.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    const extractKey = (url: string) => {
      // If it's R2 full url, extract path
      try {
        const parsed = new URL(url);
        // Path without leading slash
        return parsed.pathname.substring(1);
      } catch {
        // Fallback or local
        return url.replace(/^\/uploads\//, '');
      }
    };

    if (media.originalUrl) await storageService.deleteFile(extractKey(media.originalUrl));
    if (media.webUrl) await storageService.deleteFile(extractKey(media.webUrl));
    if (media.thumbnailUrl) await storageService.deleteFile(extractKey(media.thumbnailUrl));

    const propertyId = media.property;
    await media.deleteOne();

    const allMediaCount = await MediaModel.countDocuments({ property: propertyId, type: 'image' });
    
    const property = await PropertyModel.findById(propertyId);
    if (property) {
      property.imageCount = allMediaCount;
      if (property.coverImage === media.thumbnailUrl) {
        // Find a new cover image
        const newCover = await MediaModel.findOne({ property: propertyId, type: 'image' }).sort({ sortOrder: 1 });
        if (newCover) {
          newCover.isCover = true;
          await newCover.save();
          property.coverImage = newCover.thumbnailUrl;
        } else {
          property.coverImage = '';
        }
      }
      await property.save();
    }
  }
}

export const mediaService = new MediaService();
