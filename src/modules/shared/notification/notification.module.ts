import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AppConfigModule } from '../../../core/config/config.module';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { DebugController } from './controllers/debug.controller';
import { NotificationController } from './controllers/notification.controller';
import {
  Notification,
  NotificationLog,
  NotificationLogSchema,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  controllers: [NotificationController, DebugController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService],
})
export class NotificationModule {}
