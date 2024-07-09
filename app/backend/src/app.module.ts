import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [AuthModule, 
    ProductsModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true })]
})
export class AppModule {}
