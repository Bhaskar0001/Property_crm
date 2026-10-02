import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class StorageService {
  private client: S3Client | null = null;
  private isConfigured = false;
  private localUploadDir = path.join(__dirname, '../../public/uploads');

  constructor() {
    const { accountId, accessKeyId, secretAccessKey } = config.r2;
    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
    } else {
      console.warn('R2 storage is not fully configured, falling back to local storage.');
      this.initLocalStorage();
    }
  }

  private async initLocalStorage() {
    try {
      await fs.mkdir(this.localUploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create local upload directory:', error);
    }
  }

  public async uploadBuffer(buffer: Buffer, key: string, contentType: string, isPublic: boolean): Promise<string> {
    if (this.isConfigured && this.client) {
      try {
        const command = new PutObjectCommand({
          Bucket: config.r2.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          // R2 doesn't fully support ACL in the same way S3 does if it's public bucket, but we can try to set it or rely on bucket policy
        });
        await this.client.send(command);
        return `${config.r2.publicUrl}/${key}`;
      } catch (error) {
        console.error('Error uploading to R2:', error);
        throw new Error('Failed to upload file to storage');
      }
    } else {
      // Fallback local storage
      const localPath = path.join(this.localUploadDir, key.replace(/\//g, '_'));
      await fs.writeFile(localPath, buffer);
      return `/uploads/${key.replace(/\//g, '_')}`;
    }
  }

  public async getSignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    if (this.isConfigured && this.client) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.r2.bucketName,
          Key: key,
        });
        return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
      } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate download URL');
      }
    } else {
      return `/uploads/${key.replace(/\//g, '_')}`;
    }
  }

  public async deleteFile(key: string): Promise<void> {
    if (this.isConfigured && this.client) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: config.r2.bucketName,
          Key: key,
        });
        await this.client.send(command);
      } catch (error) {
        console.error('Error deleting from R2:', error);
        throw new Error('Failed to delete file from storage');
      }
    } else {
      try {
        const localPath = path.join(this.localUploadDir, key.replace(/\//g, '_'));
        await fs.unlink(localPath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error('Error deleting local file:', error);
        }
      }
    }
  }
}

export const storageService = new StorageService();
