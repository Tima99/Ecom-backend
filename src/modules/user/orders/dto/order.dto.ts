import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment intent ID from Stripe', example: 'pi_1234567890' })
  @IsString()
  paymentIntentId: string;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  orderId: string;
}
