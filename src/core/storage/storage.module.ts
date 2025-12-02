import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { S3Adapter } from './adapters/s3.adapter';
import { StorageConfig } from './storage.config';
import { StorageAdapter } from './adapters/storage.adapter';

@Module({
  providers: [
    StorageConfig,
    {
      provide: 'StorageAdapter',
      useClass: S3Adapter,
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