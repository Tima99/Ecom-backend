import 'multer';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { StorageService } from '../../../../core/storage/services/storage.service';
import { UploadFileDto } from '../dto/upload-file.dto';
import { FileUploadRepository } from '../repositories/file-upload.repository';
import { FileStatus, FileType, FileUploadDocument } from '../schemas/file-upload.schema';

@Injectable()
export class FileUploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    private fileUploadRepository: FileUploadRepository,
    private storageService: StorageService,
  ) {}

  async uploadSingle(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
  ): Promise<FileUploadDocument> {
    this.validateFile(file);

    const fileUrl = await this.storageService.uploadFile(file, uploadDto.folderPath);

    const fileData = {
      originalName: file.originalname,
      fileName: this.extractFileName(fileUrl),
      fileUrl,
      mimeType: file.mimetype,
      size: file.size,
      fileType: uploadDto.fileType || this.determineFileType(file.mimetype),
      folderPath: uploadDto.folderPath,
      metadata: uploadDto.metadata,
    };

    return this.fileUploadRepository.create(fileData);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    uploadDto: UploadFileDto,
  ): Promise<FileUploadDocument[]> {
    files.forEach(file => this.validateFile(file));

    const fileUrls = await this.storageService.uploadMultipleFiles(files, uploadDto.folderPath);

    const filesData = files.map((file, index) => ({
      originalName: file.originalname,
      fileName: this.extractFileName(fileUrls[index]),
      fileUrl: fileUrls[index],
      mimeType: file.mimetype,
      size: file.size,
      fileType: uploadDto.fileType || this.determineFileType(file.mimetype),
      folderPath: uploadDto.folderPath,
      metadata: uploadDto.metadata,
    }));

    return this.fileUploadRepository.createMany(filesData);
  }

  async getFile(id: string): Promise<FileUploadDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileUploadRepository.findById(new Types.ObjectId(id));
    if (!file || file.status === FileStatus.DELETED) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async getFiles(ids: string[]): Promise<FileUploadDocument[]> {
    const objectIds = ids.map(id => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid file ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    return this.fileUploadRepository.findByIds(objectIds);
  }

  async addReference(id: string): Promise<FileUploadDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileUploadRepository.incrementRefCount(new Types.ObjectId(id));
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async removeReference(id: string): Promise<FileUploadDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileUploadRepository.decrementRefCount(new Types.ObjectId(id));
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async deleteFile(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileUploadRepository.findById(new Types.ObjectId(id));
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.refCount > 0) {
      throw new BadRequestException('Cannot delete file that is still being referenced');
    }

    await this.storageService.deleteFile(file.fileUrl);
    await this.fileUploadRepository.markAsDeleted(new Types.ObjectId(id));
  }

  async getFilesByFolder(folderPath: string): Promise<FileUploadDocument[]> {
    return this.fileUploadRepository.findByFolder(folderPath);
  }

  async cleanupUnusedFiles(): Promise<void> {
    const unusedFiles = await this.fileUploadRepository.findUnusedFiles();

    for (const file of unusedFiles) {
      try {
        await this.storageService.deleteFile(file.fileUrl);
        await this.fileUploadRepository.markAsDeleted(file._id);
      } catch (error) {
        console.error(`Failed to cleanup file ${file._id}:`, error);
      }
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds maximum limit of 10MB');
    }

    if (file.mimetype.startsWith('image/') && !this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image type. Allowed: JPEG, PNG, WebP, GIF');
    }
  }

  private determineFileType(mimeType: string): FileType {
    return mimeType.startsWith('image/') ? FileType.IMAGE : FileType.DOCUMENT;
  }

  private extractFileName(fileUrl: string): string {
    return fileUrl.split('/').pop() || '';
  }
}
