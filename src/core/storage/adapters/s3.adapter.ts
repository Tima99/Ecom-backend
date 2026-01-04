import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { StorageConfig } from '../storage.config';
import { StorageAdapter } from './storage.adapter';

@Injectable()
export class S3Adapter implements StorageAdapter {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private storageConfig: StorageConfig) {
    const config = this.storageConfig.getStorageConfig();
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
    this.region = config.region;
  }

  async uploadFile(file: any, folderPath?: string): Promise<string> {
    const processedBuffer = await this.processImage(file);
    const key = this.generateFileKey(file.originalname, folderPath);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async uploadMultipleFiles(files: any[], folderPath?: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folderPath));

    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    const key = this.extractKeyFromUrl(fileUrl);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private async processImage(file: any): Promise<Buffer> {
    if (!file.mimetype.startsWith('image/')) {
      return file.buffer;
    }

    return sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  private generateFileKey(originalName: string, folderPath?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;

    return folderPath ? `${folderPath}/${fileName}` : fileName;
  }

  private extractKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);

    return url.pathname.substring(1);
  }
}
