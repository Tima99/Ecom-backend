import { Module } from '@nestjs/common';
import { CarouselModule } from './carousel/carousel.module';

@Module({
  imports: [
    CarouselModule,
  ],
})
export class AdminModule {}