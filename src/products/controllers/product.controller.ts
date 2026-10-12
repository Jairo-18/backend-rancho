import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import {
  CreateProductDocs,
  DeleteProductDocs,
  FindAdminProductsDocs,
  FindProductByIdDocs,
  SetProductImageDocs,
  UpdateProductDocs,
} from '../decorators/product.decorators.js';
import {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '../dtos/product.dto.js';
import { ProductUC } from '../useCases/productUC.uc.js';

/** Gestión de productos desde el panel admin. */
@Controller('products')
@ApiTags('Productos')
@AdminOnly()
export class ProductController {
  constructor(private readonly _productUC: ProductUC) {}

  @Get('admin')
  @FindAdminProductsDocs()
  findAll(@Query() query: AdminListQueryDto): Promise<ProductDto[]> {
    return this._productUC.findAdmin(query);
  }

  @Get('admin/:id')
  @FindProductByIdDocs()
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this._productUC.findById(id);
  }

  @Post()
  @CreateProductDocs()
  create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this._productUC.create(dto);
  }

  @Patch(':id')
  @UpdateProductDocs()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this._productUC.update(id, dto);
  }

  @Delete(':id')
  @DeleteProductDocs()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._productUC.deactivate(id);
  }

  @Put(':id/image')
  @SetProductImageDocs()
  setImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ProductDto> {
    return this._productUC.setImage(id, file?.buffer);
  }
}
