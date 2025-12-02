import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
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
    const cart = await this.getCart(userId);
    const productId = new Types.ObjectId(addToCartDto.productId);
    
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += addToCartDto.quantity;
    } else {
      cart.items.push({
        productId,
        productName: addToCartDto.productName,
        price: addToCartDto.price,
        quantity: addToCartDto.quantity,
        imageUrl: addToCartDto.imageUrl,
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
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    this.calculateTotals(cart);
    await cart.save();

    return cart;
  }

  async removeFromCart(userId: Types.ObjectId, productId: string): Promise<CartDocument> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

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
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}