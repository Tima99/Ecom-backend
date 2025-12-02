import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CarouselService } from '../services/carousel.service';
import { CreateCarouselDto } from '../dto/create-carousel.dto';
import { UpdateCarouselDto } from '../dto/update-carousel.dto';
import { CarouselQueryDto } from '../dto/carousel-query.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Admin - Carousel Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carousel' })
  @ApiResponse({ status: 201, description: 'Carousel created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCarouselDto: CreateCarouselDto) {
    return this.carouselService.create(createCarouselDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carousels with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Carousels retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: CarouselQueryDto) {
    return this.carouselService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active carousels for public display' })
  @ApiResponse({ status: 200, description: 'Active carousels retrieved successfully' })
  findActiveCarousels() {
    return this.carouselService.findActiveCarousels();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carousel by ID' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  @ApiResponse({ status: 200, description: 'Carousel retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.carouselService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update carousel by ID' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  @ApiResponse({ status: 200, description: 'Carousel updated successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateCarouselDto: UpdateCarouselDto) {
    return this.carouselService.update(id, updateCarouselDto);
  }

  @Patch(':id/order')
  @ApiOperation({ summary: 'Update carousel display order' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  @ApiResponse({ status: 200, description: 'Carousel order updated successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.carouselService.updateOrder(id, order);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete carousel by ID' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  @ApiResponse({ status: 200, description: 'Carousel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.carouselService.remove(id);
  }
}