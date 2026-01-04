import { Module } from '@nestjs/common';

import { FileUploadModule } from './file-upload/file-upload.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [FileUploadModule, NotificationModule],
  exports: [FileUploadModule, NotificationModule],
})
export class SharedModule {}
