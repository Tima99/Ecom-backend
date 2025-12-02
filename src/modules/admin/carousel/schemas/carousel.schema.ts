import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CarouselDocument = HydratedDocument<Carousel>;

export enum CarouselStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
}

@Schema({ timestamps: true })
export class Carousel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: null })
  linkUrl: string;

  @Prop({ default: null })
  description: string;

  @Prop({ type: String, enum: CarouselStatus, default: CarouselStatus.ACTIVE })
  status: CarouselStatus;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;
}

export const CarouselSchema = SchemaFactory.createForClass(Carousel);

CarouselSchema.index({ order: 1, status: 1 });
