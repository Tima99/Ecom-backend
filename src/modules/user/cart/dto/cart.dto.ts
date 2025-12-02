import { IsString, IsNumber, IsPositive, Min, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'iPhone 15' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Product price', example: 999.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Quantity to add', example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity', example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}