import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarouselRepository } from '../repositories/carousel.repository';
import { CreateCarouselDto } from '../dto/create-carousel.dto';
import { UpdateCarouselDto } from '../dto/update-carousel.dto';
import { CarouselQueryDto } from '../dto/carousel-query.dto';
import { CarouselDocument } from '../schemas/carousel.schema';

@Injectable()
export class CarouselService {
  constructor(private carouselRepository: CarouselRepository) {}

  async create(createCarouselDto: CreateCarouselDto): Promise<CarouselDocument> {
    if (createCarouselDto.startDate && createCarouselDto.endDate) {
      const startDate = new Date(createCarouselDto.startDate);
      const endDate = new Date(createCarouselDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    return this.carouselRepository.create(createCarouselDto);
  }

  async findAll(query: CarouselQueryDto) {
    const result = await this.carouselRepository.findAll(query);

    return {
      data: result.data,
      pagination: {
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(result.total / (query.limit || 10)),
      },
    };
  }

  async findOne(id: string): Promise<CarouselDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid carousel ID');
    }

    const carousel = await this.carouselRepository.findById(new Types.ObjectId(id));
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }

    return carousel;
  }

  async findActiveCarousels(): Promise<CarouselDocument[]> {
    return this.carouselRepository.findActiveCarousels();
  }

  async update(id: string, updateCarouselDto: UpdateCarouselDto): Promise<CarouselDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid carousel ID');
    }

    if (updateCarouselDto.startDate && updateCarouselDto.endDate) {
      const startDate = new Date(updateCarouselDto.startDate);
      const endDate = new Date(updateCarouselDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const carousel = await this.carouselRepository.update(new Types.ObjectId(id), updateCarouselDto);
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }

    return carousel;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid carousel ID');
    }

    const carousel = await this.carouselRepository.delete(new Types.ObjectId(id));
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }
  }

  async updateOrder(id: string, newOrder: number): Promise<CarouselDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid carousel ID');
    }

    const carousel = await this.carouselRepository.updateOrder(new Types.ObjectId(id), newOrder);
    if (!carousel) {
      throw new NotFoundException('Carousel not found');
    }

    return carousel;
  }
}