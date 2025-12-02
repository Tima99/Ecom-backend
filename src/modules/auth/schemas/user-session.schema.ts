import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserSessionDocument = HydratedDocument<UserSession>;

@Schema({ timestamps: true })
export class UserSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: true })
  deviceInfo: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastAccessedAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UserSessionSchema.index({ userId: 1, isActive: 1 });
