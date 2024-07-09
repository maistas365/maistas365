import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { all } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService, private config: ConfigService) {}

    //get all of the products from the database
    async getAllProducts(){
        const allProducts = await this.prisma.product.findMany()
        return allProducts;
    }

}
