import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CreateProductDto, ProductQueryDto, UpdateProductDto } from '../dto/product.dto';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, ProductStatus } from '../schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Set status to OUT_OF_STOCK if stock is 0
    if (createProductDto.stock === 0) {
      createProductDto.status = ProductStatus.OUT_OF_STOCK;
    }

    return this.productRepository.create(createProductDto);
  }

  async findAll(query: ProductQueryDto) {
    const result = await this.productRepository.findAll(query);

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

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.findById(new Types.ObjectId(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    // Update status based on stock
    if (updateProductDto.stock !== undefined) {
      if (updateProductDto.stock === 0) {
        updateProductDto.status = ProductStatus.OUT_OF_STOCK;
      } else if (updateProductDto.status === ProductStatus.OUT_OF_STOCK) {
        updateProductDto.status = ProductStatus.ACTIVE;
      }
    }

    const product = await this.productRepository.update(new Types.ObjectId(id), updateProductDto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.delete(new Types.ObjectId(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  async getActiveProducts(): Promise<ProductDocument[]> {
    return this.productRepository.findActiveProducts();
  }

  async getCategories(): Promise<string[]> {
    return this.productRepository.getCategories();
  }

  async updateStock(id: string, quantity: number): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.updateStock(new Types.ObjectId(id), quantity);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Update status if stock becomes 0
    if (product.stock <= 0) {
      await this.productRepository.update(product._id, { status: ProductStatus.OUT_OF_STOCK });
    }

    return product;
  }
}
