import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarouselController } from './controllers/carousel.controller';
import { CarouselService } from './services/carousel.service';
import { CarouselRepository } from './repositories/carousel.repository';
import { Carousel, CarouselSchema } from './schemas/carousel.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Carousel.name, schema: CarouselSchema }])],
  controllers: [CarouselController],
  providers: [CarouselService, CarouselRepository],
  exports: [CarouselService],
})
export class CarouselModule {}
