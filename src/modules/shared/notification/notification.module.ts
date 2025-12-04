import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationController } from './controllers/notification.controller';
import { DebugController } from './controllers/debug.controller';
import { NotificationService } from './services/notification.service';
import {
  Notification,
  NotificationSchema,
  NotificationLog,
  NotificationLogSchema,
} from './schemas/notification.schema';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { AppConfigModule } from '../../../core/config/config.module';

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
