import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from '../schemas/product.schema';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    return this.productModel.create(createProductDto);
  }

  async findAll(query: ProductQueryDto): Promise<{ data: ProductDocument[]; total: number }> {
    const filter: any = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.productModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findById(id: Types.ObjectId): Promise<ProductDocument | null> {
    return this.productModel.findById(id);
  }

  async findByIds(ids: Types.ObjectId[]): Promise<ProductDocument[]> {
    return this.productModel.find({ _id: { $in: ids } });
  }

  async update(
    id: Types.ObjectId,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndDelete(id);
  }

  async updateStock(id: Types.ObjectId, quantity: number): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, { $inc: { stock: -quantity } }, { new: true });
  }

  async findActiveProducts(): Promise<ProductDocument[]> {
    return this.productModel.find({
      status: ProductStatus.ACTIVE,
      stock: { $gt: 0 },
    });
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category');
  }
}
