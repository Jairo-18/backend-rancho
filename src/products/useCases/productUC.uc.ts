import { Injectable } from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '../dtos/product.dto.js';
import { ProductService } from '../services/product.service.js';
import { ProductImageService } from '../services/productImage.service.js';

@Injectable()
export class ProductUC {
  constructor(
    private readonly _productService: ProductService,
    private readonly _productImageService: ProductImageService,
  ) {}

  findPublic(): Promise<ProductDto[]> {
    return this._productService.findPublic();
  }

  findAdmin(query: AdminListQueryDto): Promise<ProductDto[]> {
    return this._productService.findAdmin(query);
  }

  findById(id: string): Promise<ProductDto> {
    return this._productService.findById(id);
  }

  create(dto: CreateProductDto): Promise<ProductDto> {
    return this._productService.create(dto);
  }

  update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    return this._productService.update(id, dto);
  }

  deactivate(id: string): Promise<void> {
    return this._productService.deactivate(id);
  }

  async setImage(id: string, file: Buffer | undefined): Promise<ProductDto> {
    await this._productImageService.set(id, file);
    return this._productService.findById(id);
  }
}
