import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationProvider,
  NotificationType,
  DeviceType,
} from '../../../../types/notification.types';

export class NotificationPayloadDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Icon URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Click action URL' })
  @IsOptional()
  @IsString()
  clickAction?: string;

  @ApiPropertyOptional({ description: 'Additional data' })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}

export class NotificationTargetDto {
  @ApiPropertyOptional({ description: 'Single user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Multiple user IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({ description: 'Device tokens' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deviceTokens?: string[];

  @ApiPropertyOptional({ description: 'Topic name' })
  @IsOptional()
  @IsString()
  topic?: string;
}

export class ScheduleOptionsDto {
  @ApiPropertyOptional({ description: 'Send immediately', default: true })
  @IsOptional()
  @IsBoolean()
  sendNow?: boolean;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Notification provider', enum: NotificationProvider })
  @IsEnum(NotificationProvider)
  provider: NotificationProvider;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification payload' })
  @ValidateNested()
  @Type(() => NotificationPayloadDto)
  payload: NotificationPayloadDto;

  @ApiProperty({ description: 'Notification target' })
  @ValidateNested()
  @Type(() => NotificationTargetDto)
  target: NotificationTargetDto;

  @ApiPropertyOptional({ description: 'Schedule options' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleOptionsDto)
  schedule?: ScheduleOptionsDto;

  @ApiPropertyOptional({ description: 'Priority', enum: ['high', 'normal'] })
  @IsOptional()
  @IsEnum(['high', 'normal'])
  priority?: 'high' | 'normal';
}

export class RegisterDeviceDto {
  @ApiProperty({ description: 'Device token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Device type', enum: DeviceType })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
