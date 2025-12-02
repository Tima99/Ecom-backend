import { Module } from '@nestjs/common';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  exports: [FileUploadModule],
})
export class SharedModule {}
