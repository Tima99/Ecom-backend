import { Injectable } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter';
import { StorageConfig } from '../storage.config';
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import 'multer';


@Injectable()
export class CloudinaryAdapter extends StorageAdapter {
  constructor(private storageConfig: StorageConfig) {
    super();
    const config = this.storageConfig.getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  async uploadFile(file: Express.Multer.File, folderPath?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        resource_type: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto',
      };

      if (folderPath) {
        uploadOptions.folder = folderPath;
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No secure URL returned'));
          }
        }
      ).end(file.buffer);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folderPath?: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folderPath));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(fileUrl);
    await cloudinary.uploader.destroy(publicId);
  }

  async getSignedUrl(fileUrl: string, expiresIn?: number): Promise<string> {
    return fileUrl;
  }

  private extractPublicIdFromUrl(fileUrl: string): string {
    const parts = fileUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
