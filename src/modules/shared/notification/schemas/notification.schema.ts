import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  NotificationProvider,
  NotificationStatus,
  NotificationType,
  DeviceType,
} from '../../../../types/notification.types';

export type NotificationDocument = HydratedDocument<Notification>;
export type NotificationLogDocument = HydratedDocument<NotificationLog>;

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: DeviceType })
  deviceType: DeviceType;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deviceInfo?: string;
}

@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ required: true, enum: NotificationProvider })
  provider: NotificationProvider;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  image?: string;

  @Prop()
  icon?: string;

  @Prop({ type: Object })
  data?: Record<string, string>;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  targetUsers: Types.ObjectId[];

  @Prop({ type: [String] })
  deviceTokens?: string[];

  @Prop()
  topic?: string;

  @Prop({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  messageId?: string;

  @Prop()
  error?: string;

  @Prop({ type: [String] })
  failedTokens?: string[];

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  failureCount: number;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [DeviceToken] })
  deviceTokens: DeviceToken[];

  @Prop({ default: true })
  pushEnabled: boolean;

  @Prop({ default: true })
  emailEnabled: boolean;

  @Prop({ default: true })
  smsEnabled: boolean;

  @Prop()
  timezone?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);

NotificationSchema.index({ userId: 1 });
NotificationLogSchema.index({ status: 1, scheduledAt: 1 });
NotificationLogSchema.index({ targetUsers: 1 });
