import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindPublicProductsDocs } from '../decorators/product.decorators.js';
import { ProductDto } from '../dtos/product.dto.js';
import { ProductUC } from '../useCases/productUC.uc.js';

@Controller('products')
@ApiTags('Productos (público)')
export class ProductPublicController {
  constructor(private readonly _productUC: ProductUC) {}

  @Get()
  @FindPublicProductsDocs()
  findAll(): Promise<ProductDto[]> {
    return this._productUC.findPublic();
  }
}
