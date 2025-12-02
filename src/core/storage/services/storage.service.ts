import { Injectable } from '@nestjs/common';
import type { StorageAdapter } from '../adapters/storage.adapter';
import 'multer';

@Injectable()
export class StorageService {
  constructor(private storageAdapter: StorageAdapter) {}

  async uploadFile(file: Express.Multer.File, folderPath?: string): Promise<string> {
    return this.storageAdapter.uploadFile(file, folderPath);
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folderPath?: string): Promise<string[]> {
    return this.storageAdapter.uploadMultipleFiles(files, folderPath);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.storageAdapter.deleteFile(fileUrl);
  }

  async getSignedUrl(fileUrl: string, expiresIn?: number): Promise<string> {
    return this.storageAdapter.getSignedUrl(fileUrl, expiresIn);
  }
}
