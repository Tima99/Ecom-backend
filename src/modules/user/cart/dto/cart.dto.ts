import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity', example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
