import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Notification,
  NotificationDocument,
  NotificationLog,
  NotificationLogDocument,
} from '../schemas/notification.schema';
import { FirebaseService } from '../../../../core/firebase/firebase.service';
import { SendNotificationDto, RegisterDeviceDto } from '../dto/notification.dto';
import {
  NotificationProvider,
  NotificationStatus,
  NotificationResult,
  DeviceType,
} from '../../../../types/notification.types';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    private firebaseService: FirebaseService,
  ) {}

  async sendNotification(sendNotificationDto: SendNotificationDto): Promise<NotificationResult> {
    const { provider, payload, target, schedule } = sendNotificationDto;

    // Create notification log
    const notificationLog = await this.createNotificationLog(sendNotificationDto);

    if (schedule?.sendNow === false && schedule?.scheduledAt) {
      // Schedule for later
      notificationLog.status = NotificationStatus.SCHEDULED;
      notificationLog.scheduledAt = new Date(schedule.scheduledAt);
      await notificationLog.save();

      return {
        success: true,
        messageId: notificationLog._id.toString(),
      };
    }

    // Send immediately
    return this.executeNotification(notificationLog);
  }

  async registerDevice(userId: string, registerDeviceDto: RegisterDeviceDto): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    let notification = await this.notificationModel.findOne({ userId: userObjectId });

    if (!notification) {
      notification = await this.notificationModel.create({
        userId: userObjectId,
        deviceTokens: [],
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
      });
    }

    // Remove existing token if exists
    notification.deviceTokens = notification.deviceTokens.filter(
      dt => dt.token !== registerDeviceDto.token,
    );

    // Add new token
    notification.deviceTokens.push({
      token: registerDeviceDto.token,
      deviceType: registerDeviceDto.deviceType,
      isActive: true,
      deviceInfo: registerDeviceDto.deviceInfo,
    });

    await notification.save();
  }

  async getUserDeviceTokens(userId: string, deviceType?: DeviceType): Promise<string[]> {
    const notification = await this.notificationModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!notification) return [];

    let tokens = notification.deviceTokens.filter(dt => dt.isActive);

    if (deviceType) {
      tokens = tokens.filter(dt => dt.deviceType === deviceType);
    }

    return tokens.map(dt => dt.token);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const scheduledNotifications = await this.notificationLogModel.find({
      status: NotificationStatus.SCHEDULED,
      scheduledAt: { $lte: new Date() },
    });

    for (const notification of scheduledNotifications) {
      await this.executeNotification(notification);
    }
  }

  private async executeNotification(
    notificationLog: NotificationLogDocument,
  ): Promise<NotificationResult> {
    try {
      let result: NotificationResult;

      if (notificationLog.provider === NotificationProvider.FIREBASE) {
        result = await this.sendFirebaseNotification(notificationLog);
      } else {
        throw new BadRequestException(`Provider ${notificationLog.provider} not implemented`);
      }

      // Update log
      notificationLog.status = result.success ? NotificationStatus.SENT : NotificationStatus.FAILED;
      notificationLog.sentAt = new Date();
      notificationLog.messageId = result.messageId;
      notificationLog.error = result.error;
      notificationLog.failedTokens = result.failedTokens || [];

      if (result.failedTokens) {
        notificationLog.failureCount = result.failedTokens.length;
        notificationLog.successCount =
          (notificationLog.deviceTokens?.length || 0) - result.failedTokens.length;
      } else {
        notificationLog.successCount = result.success ? 1 : 0;
        notificationLog.failureCount = result.success ? 0 : 1;
      }

      await notificationLog.save();
      return result;
    } catch (error) {
      console.log(error)
      notificationLog.status = NotificationStatus.FAILED;
      notificationLog.error = error.message;
      await notificationLog.save();

      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async sendFirebaseNotification(
    notificationLog: NotificationLogDocument,
  ): Promise<NotificationResult> {
    const payload = {
      title: notificationLog.title,
      body: notificationLog.body,
      image: notificationLog.image,
      icon: notificationLog.icon,
      data: notificationLog.data,
    };

    if (notificationLog.topic) {
      return this.firebaseService.sendToTopic(notificationLog.topic, payload);
    }

    if (notificationLog.deviceTokens && notificationLog.deviceTokens.length > 0) {
      if (notificationLog.deviceTokens.length === 1) {
        return this.firebaseService.sendToDevice(notificationLog.deviceTokens[0], payload);
      } else {
        return this.firebaseService.sendToMultipleDevices(notificationLog.deviceTokens, payload);
      }
    }

    // Get device tokens from target users
    const deviceTokens: string[] = [];
    for (const userId of notificationLog.targetUsers) {
      const userTokens = await this.getUserDeviceTokens(userId.toString());
      deviceTokens.push(...userTokens);
    }

    if (deviceTokens.length === 0) {
      return {
        success: false,
        error: 'No device tokens found for target users',
      };
    }

    return this.firebaseService.sendToMultipleDevices(deviceTokens, payload);
  }

  private async createNotificationLog(dto: SendNotificationDto): Promise<NotificationLogDocument> {
    const targetUsers: Types.ObjectId[] = [];

    if (dto.target.userId) {
      targetUsers.push(new Types.ObjectId(dto.target.userId));
    }

    if (dto.target.userIds) {
      targetUsers.push(...dto.target.userIds.map(id => new Types.ObjectId(id)));
    }

    return this.notificationLogModel.create({
      provider: dto.provider,
      type: dto.type,
      title: dto.payload.title,
      body: dto.payload.body,
      image: dto.payload.image,
      icon: dto.payload.icon,
      data: dto.payload.data,
      targetUsers,
      deviceTokens: dto.target.deviceTokens,
      topic: dto.target.topic,
      status: NotificationStatus.PENDING,
    });
  }
}
