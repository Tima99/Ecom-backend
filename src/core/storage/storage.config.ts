import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StorageConfigType {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
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
}