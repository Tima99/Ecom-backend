import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '../schemas/file-upload.schema';

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'Folder path for organizing files', example: 'products/images' })
  @IsOptional()
  @IsString()
  folderPath?: string;

  @ApiPropertyOptional({ enum: FileType, description: 'Type of file being uploaded' })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiPropertyOptional({ description: 'Additional metadata for the file' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class FileReferenceDto {
  @ApiPropertyOptional({ description: 'File ID to reference' })
  @IsString()
  fileId: string;
}