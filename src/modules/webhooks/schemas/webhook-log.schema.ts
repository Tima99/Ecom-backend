import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WebhookLogDocument = HydratedDocument<WebhookLog>;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  paymentIntentId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ required: true, default: false })
  processed: boolean;

  @Prop()
  error?: string;

  @Prop({ type: Object })
  rawData?: unknown;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

WebhookLogSchema.index({ eventId: 1 });
WebhookLogSchema.index({ paymentIntentId: 1 });
WebhookLogSchema.index({ processed: 1 });
