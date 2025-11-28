import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailVerificationDocument = HydratedDocument<EmailVerification>;

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  verified: boolean;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(EmailVerification);
