import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment method', example: 'stripe' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Payment token from frontend' })
  @IsOptional()
  @IsString()
  paymentToken?: string;
}