import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  //get all of the products from the database
  async getAllProducts() {
    const allProducts = await this.prisma.product.findMany({
      include: {
        priceHistory: true,
        price: true,
      },
      take: 100,
    });
    return allProducts;
  }

  async getAllPrices() {
    const allPrices = await this.prisma.product.findMany({
      select: {
        price: true,
        name: true,
      },
    });
    return allPrices;
  }
}
