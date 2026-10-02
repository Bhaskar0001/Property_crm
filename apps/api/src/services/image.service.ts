import sharp from 'sharp';

export interface ProcessedImages {
  originalBuffer: Buffer;
  webBuffer: Buffer;
  thumbBuffer: Buffer;
}

export class ImageService {
  /**
   * Process an uploaded file buffer and return resized versions
   * - Resize to thumbnail: 300x200 (cover, webp, 80% quality)
   * - Resize to web-optimized: 1200x800 (contain or cover, webp, 85% quality)
   * 
   * @param buffer The original uploaded image buffer
   */
  public async processImage(buffer: Buffer): Promise<ProcessedImages> {
    try {
      const originalBuffer = buffer;

      const thumbBuffer = await sharp(buffer)
        .resize(300, 200, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();

      const webBuffer = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'inside', // or 'cover' as per instructions, 'inside' is safer to keep aspect ratio without crop for large displays
        })
        .webp({ quality: 85 })
        .toBuffer();

      return {
        originalBuffer,
        webBuffer,
        thumbBuffer,
      };
    } catch (error) {
      console.error('Error processing image with sharp:', error);
      throw new Error('Failed to process image');
    }
  }
}

export const imageService = new ImageService();
