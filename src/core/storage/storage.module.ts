import { Module } from '@nestjs/common';

import { CloudinaryAdapter } from './adapters/cloudinary.adapter';
import { StorageAdapter } from './adapters/storage.adapter';
import { StorageService } from './services/storage.service';
import { StorageConfig } from './storage.config';

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
