import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { S3Adapter } from './adapters/s3.adapter';
import { R2Adapter } from './adapters/r2.adapter';
import { CloudinaryAdapter } from './adapters/cloudinary.adapter';
import { StorageConfig } from './storage.config';
import { StorageAdapter } from './adapters/storage.adapter';

@Module({
  providers: [
    StorageConfig,
    {
      provide: 'StorageAdapter',
      useClass: CloudinaryAdapter, // Using Cloudinary
    },
    {
      provide: StorageService,
      useFactory: (adapter: StorageAdapter) => new StorageService(adapter),
      inject: ['StorageAdapter'],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
