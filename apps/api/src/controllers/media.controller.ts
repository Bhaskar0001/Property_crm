import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service';
import { AuthRequest } from '../middlewares/auth';

export const uploadMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const files = req.files as Express.Multer.File[];
    const userId = req.user?._id?.toString() || '';

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }

    const media = await mediaService.uploadPropertyImages(propertyId, files, userId);
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

export const addEmbedMedia = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const { url, type, title } = req.body;
    const userId = req.user?._id?.toString() || '';

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const media = await mediaService.addEmbedMedia(propertyId, { url, type, title, uploadedBy: userId });
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

export const getPropertyMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const media = await mediaService.getPropertyMedia(propertyId);
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

export const setCoverImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId is required in body' });
    }

    const media = await mediaService.setCoverImage(id, propertyId);
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

export const reorderMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const { items } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    await mediaService.reorderMedia(propertyId, items);
    res.status(200).json({ success: true, message: 'Media reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
};
