import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StorageConfigType {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface R2StorageConfigType {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export interface CloudinaryConfigType {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

@Injectable()
export class StorageConfig {
  constructor(private configService: ConfigService) {}

  getStorageConfig(): StorageConfigType {
    return {
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      bucketName: this.configService.get<string>('AWS_S3_BUCKET_NAME') || '',
    };
  }

  getR2StorageConfig(): R2StorageConfigType {
    return {
      endpoint: this.configService.get<string>('R2_ENDPOINT') || '',
      accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
      secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
      bucketName: this.configService.get<string>('R2_BUCKET_NAME') || '',
      publicUrl: this.configService.get<string>('R2_PUBLIC_URL') || '',
    };
  }

  getCloudinaryConfig(): CloudinaryConfigType {
    return {
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '',
      apiKey: this.configService.get<string>('CLOUDINARY_API_KEY') || '',
      apiSecret: this.configService.get<string>('CLOUDINARY_API_SECRET') || '',
    };
  }
}
