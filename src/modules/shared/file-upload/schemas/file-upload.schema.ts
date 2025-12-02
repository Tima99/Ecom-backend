import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FileUploadDocument = HydratedDocument<FileUpload>;

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export enum FileStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

@Schema({ timestamps: true })
export class FileUpload {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: String, enum: FileType, required: true })
  fileType: FileType;

  @Prop({ default: null })
  folderPath: string;

  @Prop({ default: 0 })
  refCount: number;

  @Prop({ type: String, enum: FileStatus, default: FileStatus.ACTIVE })
  status: FileStatus;

  @Prop({ type: Object, default: null })
  metadata: Record<string, any>;
}

export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);

FileUploadSchema.index({ fileName: 1 });
FileUploadSchema.index({ fileType: 1, status: 1 });
FileUploadSchema.index({ folderPath: 1 });
