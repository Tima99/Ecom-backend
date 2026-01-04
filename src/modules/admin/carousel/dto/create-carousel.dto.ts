import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { CarouselStatus } from '../schemas/carousel.schema';

export class CreateCarouselDto {
  @ApiProperty({ description: 'Carousel title', example: 'Summer Sale Banner' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Image URL for carousel', example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Link URL when carousel is clicked',
    example: 'https://example.com/sale',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({
    description: 'Carousel description',
    example: 'Get 50% off on summer collection',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: CarouselStatus,
    description: 'Carousel status',
    example: CarouselStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CarouselStatus)
  status?: CarouselStatus;

  @ApiProperty({ description: 'Display order', example: 1 })
  @IsNumber()
  order: number;

  @ApiPropertyOptional({
    description: 'Start date for scheduled carousel',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for scheduled carousel',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
