import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadController } from './controllers/file-upload.controller';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadRepository } from './repositories/file-upload.repository';
import { FileUpload, FileUploadSchema } from './schemas/file-upload.schema';
import { StorageModule } from '../../../core/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileUpload.name, schema: FileUploadSchema }]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    StorageModule,
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
  exports: [FileUploadService],
})
export class FileUploadModule {}
