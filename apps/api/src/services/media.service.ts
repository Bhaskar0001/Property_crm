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
      if (!file.mimetype.startsWith('image/')) continue;
      
      const processed = await imageService.processImage(file.buffer);
      const ext = path.extname(file.originalname) || '.jpg';
      const baseKey = `properties/${propertyId}/${crypto.randomBytes(16).toString('hex')}`;
      
      const [originalUrl, webUrl, thumbnailUrl] = await Promise.all([
        storageService.uploadBuffer(processed.originalBuffer, `${baseKey}_original${ext}`, file.mimetype, true),
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
    }

    // Update Property model image count and set cover image if it isn't set
    const property = await PropertyModel.findById(propertyId);
    if (property) {
      const allMediaCount = await MediaModel.countDocuments({ property: propertyId, type: 'image' });
      property.imageCount = allMediaCount;
      
      if (!property.coverImage && results.length > 0) {
        const firstMedia = results[0];
        firstMedia.isCover = true;
        await firstMedia.save();
        property.coverImage = firstMedia.thumbnailUrl;
      }
      
      await property.save();
    }

    return results;
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
