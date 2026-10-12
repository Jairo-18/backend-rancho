import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller.js';
import { ProductPublicController } from './controllers/product-public.controller.js';
import { ProductService } from './services/product.service.js';
import { ProductImageService } from './services/productImage.service.js';
import { ProductUC } from './useCases/productUC.uc.js';

@Module({
  controllers: [ProductController, ProductPublicController],
  providers: [ProductUC, ProductService, ProductImageService],
})
export class ProductModule {}
