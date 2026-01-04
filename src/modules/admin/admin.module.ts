import { Module } from '@nestjs/common';

import { CarouselModule } from './carousel/carousel.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [CarouselModule, ItemsModule],
})
export class AdminModule {}
