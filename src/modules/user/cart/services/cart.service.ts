import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import { Product, ProductDocument } from '../../../admin/items/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private itemModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: Types.ObjectId): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    return cart;
  }

  async addToCart(userId: Types.ObjectId, addToCartDto: AddToCartDto): Promise<CartDocument> {
    const productId = new Types.ObjectId(addToCartDto.productId);

    // Fetch product details
    const product = await this.itemModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate product status
    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException(`Only ${product.stock} items available in stock`);
    }

    const cart = await this.getCart(userId);
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString(),
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + addToCartDto.quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add ${addToCartDto.quantity} more items. Only ${product.stock - cart.items[existingItemIndex].quantity} available`,
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        price: product.price,
        quantity: addToCartDto.quantity,
        imageUrl: product.images?.[0],
      });
    }

    this.calculateTotals(cart);
    await cart.save();

    return cart;
  }

  async updateCartItem(
    userId: Types.ObjectId,
    productId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Validate stock availability
    const product = await this.itemModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'active') {
      throw new BadRequestException('Product is no longer available');
    }

    if (updateDto.quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items available in stock`);
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed
    this.calculateTotals(cart);
    await cart.save();

    return cart;
  }

  async removeFromCart(userId: Types.ObjectId, productId: string): Promise<CartDocument> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    this.calculateTotals(cart);
    await cart.save();

    return cart;
  }

  async clearCart(userId: Types.ObjectId): Promise<CartDocument> {
    const cart = await this.getCart(userId);
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    await cart.save();

    return cart;
  }

  private calculateTotals(cart: CartDocument): void {
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
