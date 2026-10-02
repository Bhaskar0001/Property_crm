import { storageService } from './storage.service';
import { PropertyDocumentModel } from '../models/PropertyDocument';
import crypto from 'crypto';
import path from 'path';

export class ForbiddenError extends Error {
  public statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class DocumentService {
  public async uploadDocument(
    propertyId: string,
    file: Express.Multer.File,
    data: { name: string; type: string; visibility: 'public' | 'internal' | 'admin_only'; expiryDate?: string },
    uploadedBy: string
  ) {
    const ext = path.extname(file.originalname) || '';
    const key = `documents/${propertyId}/${crypto.randomBytes(16).toString('hex')}${ext}`;
    
    // Internal/admin docs shouldn't be fully public if possible, but our storageService puts them in the same bucket
    // For R2, if we use publicUrl, it's public. However, we'll store the key or the URL and use getSignedDownloadUrl for non-public
    // Actually, `uploadBuffer` returns a URL. If it's not public, we shouldn't expose the direct URL.
    const url = await storageService.uploadBuffer(file.buffer, key, file.mimetype, data.visibility === 'public');

    const document = new PropertyDocumentModel({
      property: propertyId,
      name: data.name,
      type: data.type,
      visibility: data.visibility,
      fileUrl: url,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    });

    await document.save();
    return document;
  }

  public async getPropertyDocuments(propertyId: string, user?: { role: string; permissions: string[] }) {
    let query: any = { property: propertyId };

    if (!user) {
      // Public / Unauthenticated
      query.visibility = 'public';
    } else if (user.role === 'admin' || user.permissions.includes('admin')) {
      // Admin sees everything
    } else if (user.permissions.includes('properties.documents.view')) {
      // Staff with permission
      query.visibility = { $in: ['public', 'internal'] };
    } else {
      // Staff without permission
      query.visibility = 'public';
    }

    return PropertyDocumentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  public async getDocumentDownloadUrl(documentId: string, user?: { role: string; permissions: string[] }) {
    const document = await PropertyDocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Permission check
    if (document.visibility === 'admin_only') {
      if (!user || (user.role !== 'admin' && !user.permissions.includes('admin'))) {
        throw new ForbiddenError('Access denied: Admin only');
      }
    } else if (document.visibility === 'internal') {
      if (!user || (user.role !== 'admin' && !user.permissions.includes('properties.documents.view'))) {
        throw new ForbiddenError('Access denied: Internal document');
      }
    }

    const extractKey = (url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.pathname.substring(1);
      } catch {
        return url.replace(/^\/uploads\//, '');
      }
    };

    const key = extractKey(document.fileUrl);

    if (document.visibility === 'public') {
      return document.fileUrl; // Direct URL
    } else {
      // Generate a signed URL for private/internal docs
      // Note: for this to work correctly on private docs, the R2 bucket needs them to not be public, 
      // or the app just obscures the direct link. Our storage service `uploadBuffer` currently doesn't enforce private ACL, 
      // but using signed URL is the required behavior.
      return await storageService.getSignedDownloadUrl(key, 3600);
    }
  }

  public async deleteDocument(documentId: string) {
    const document = await PropertyDocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const extractKey = (url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.pathname.substring(1);
      } catch {
        return url.replace(/^\/uploads\//, '');
      }
    };

    const key = extractKey(document.fileUrl);
    await storageService.deleteFile(key);
    
    await document.deleteOne();
  }
}

export const documentService = new DocumentService();
