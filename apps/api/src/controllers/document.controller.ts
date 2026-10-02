import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { AuthRequest } from '../middlewares/auth';

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const file = req.file;
    const { name, type, visibility, expiryDate } = req.body;
    const userId = req.user?._id?.toString() || '';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const document = await documentService.uploadDocument(
      propertyId,
      file,
      { name, type, visibility, expiryDate },
      userId
    );

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const getPropertyDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const user = (req as any).user;
    const documents = await documentService.getPropertyDocuments(propertyId, user);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

export const getDocumentDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const url = await documentService.getDocumentDownloadUrl(id, user);
    res.status(200).json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
