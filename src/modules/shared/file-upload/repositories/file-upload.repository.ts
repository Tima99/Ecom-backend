import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileUpload, FileUploadDocument, FileStatus } from '../schemas/file-upload.schema';

@Injectable()
export class FileUploadRepository {
  constructor(
    @InjectModel(FileUpload.name)
    private fileUploadModel: Model<FileUploadDocument>,
  ) {}

  async create(fileData: Partial<FileUpload>): Promise<FileUploadDocument> {
    return this.fileUploadModel.create(fileData);
  }

  async createMany(filesData: Partial<FileUpload>[]): Promise<FileUploadDocument[]> {
    return this.fileUploadModel.insertMany(filesData) as Promise<FileUploadDocument[]>;
  }

  async findById(id: Types.ObjectId): Promise<FileUploadDocument | null> {
    return this.fileUploadModel.findById(id);
  }

  async findByIds(ids: Types.ObjectId[]): Promise<FileUploadDocument[]> {
    return this.fileUploadModel.find({ _id: { $in: ids }, status: FileStatus.ACTIVE });
  }

  async findByFolder(folderPath: string): Promise<FileUploadDocument[]> {
    return this.fileUploadModel.find({ folderPath, status: FileStatus.ACTIVE });
  }

  async incrementRefCount(id: Types.ObjectId): Promise<FileUploadDocument | null> {
    return this.fileUploadModel.findByIdAndUpdate(id, { $inc: { refCount: 1 } }, { new: true });
  }

  async decrementRefCount(id: Types.ObjectId): Promise<FileUploadDocument | null> {
    return this.fileUploadModel.findByIdAndUpdate(id, { $inc: { refCount: -1 } }, { new: true });
  }

  async markAsDeleted(id: Types.ObjectId): Promise<FileUploadDocument | null> {
    return this.fileUploadModel.findByIdAndUpdate(
      id,
      { status: FileStatus.DELETED },
      { new: true },
    );
  }

  async findUnusedFiles(): Promise<FileUploadDocument[]> {
    return this.fileUploadModel.find({
      refCount: 0,
      status: FileStatus.ACTIVE,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours old
    });
  }

  async update(
    id: Types.ObjectId,
    updateData: Partial<FileUpload>,
  ): Promise<FileUploadDocument | null> {
    return this.fileUploadModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}
