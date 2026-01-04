import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { CarouselStatus } from '../schemas/carousel.schema';

export class CarouselQueryDto {
  @ApiPropertyOptional({ enum: CarouselStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(CarouselStatus)
  status?: CarouselStatus;

  @ApiPropertyOptional({ description: 'Search by title', example: 'summer' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
