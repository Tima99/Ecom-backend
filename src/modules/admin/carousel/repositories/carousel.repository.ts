import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Carousel, CarouselDocument, CarouselStatus } from '../schemas/carousel.schema';
import { CreateCarouselDto } from '../dto/create-carousel.dto';
import { UpdateCarouselDto } from '../dto/update-carousel.dto';
import { CarouselQueryDto } from '../dto/carousel-query.dto';

@Injectable()
export class CarouselRepository {
  constructor(
    @InjectModel(Carousel.name)
    private carouselModel: Model<CarouselDocument>,
  ) {}

  async create(createCarouselDto: CreateCarouselDto): Promise<CarouselDocument> {
    return this.carouselModel.create(createCarouselDto);
  }

  async findAll(query: CarouselQueryDto): Promise<{ data: CarouselDocument[]; total: number }> {
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.carouselModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      this.carouselModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findById(id: Types.ObjectId): Promise<CarouselDocument | null> {
    return this.carouselModel.findById(id);
  }

  async findActiveCarousels(): Promise<CarouselDocument[]> {
    return this.carouselModel
      .find({
        status: CarouselStatus.ACTIVE,
      })
      .sort({ order: 1 });
  }

  async update(
    id: Types.ObjectId,
    updateCarouselDto: UpdateCarouselDto,
  ): Promise<CarouselDocument | null> {
    return this.carouselModel.findByIdAndUpdate(id, updateCarouselDto, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<CarouselDocument | null> {
    return this.carouselModel.findByIdAndDelete(id);
  }

  async updateOrder(id: Types.ObjectId, newOrder: number): Promise<CarouselDocument | null> {
    return this.carouselModel.findByIdAndUpdate(id, { order: newOrder }, { new: true });
  }
}
