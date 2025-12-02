import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TwoFactorAuthDocument = HydratedDocument<TwoFactorAuth>;

@Schema({ timestamps: true })
export class TwoFactorAuth {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ required: true })
  sessionId: string;
}

export const TwoFactorAuthSchema = SchemaFactory.createForClass(TwoFactorAuth);

TwoFactorAuthSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
TwoFactorAuthSchema.index({ userId: 1, sessionId: 1 });
