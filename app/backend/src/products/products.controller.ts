import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private ProductsService: ProductsService) {}

    @Get('getall')
    getAllProducts(){
        return this.ProductsService.getAllProducts();
    }

    @Get('getallprices')
    getAllPrices(){
        return this.ProductsService.getAllPrices();
    }
}
