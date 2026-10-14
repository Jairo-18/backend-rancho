import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ImageUpload } from '../../shared/decorators/image-upload.decorator.js';
import { ProductDto } from '../dtos/product.dto.js';

export function FindPublicProductsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Catálogo público (solo productos activos)' }),
    ApiOkResponse({ type: ProductDto, isArray: true }),
  );
}

export function FindPublicProductDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Detalle público de un producto activo, por slug',
    }),
    ApiOkResponse({ type: ProductDto }),
  );
}

export function FindAdminProductsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Todos los productos, con búsqueda y filtro' }),
    ApiOkResponse({ type: ProductDto, isArray: true }),
  );
}

export function FindProductByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Producto por id (panel admin)' }),
    ApiOkResponse({ type: ProductDto }),
    ApiNotFoundResponse({ description: 'Producto no encontrado' }),
  );
}

export function CreateProductDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crea el producto inactivo; se activa al tener foto',
    }),
    ApiOkResponse({ type: ProductDto }),
  );
}

export function UpdateProductDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualiza el producto (activar exige foto)' }),
    ApiOkResponse({ type: ProductDto }),
    ApiBadRequestResponse({
      description: 'Datos inválidos o sin foto al activar',
    }),
  );
}

export function DeleteProductDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Borrado lógico: desactiva el producto' }),
    ApiNoContentResponse(),
  );
}

export function SetProductImageDocs() {
  return applyDecorators(
    ImageUpload(),
    ApiOperation({
      summary: 'Pone o reemplaza la foto principal (borra la anterior)',
    }),
    ApiOkResponse({ type: ProductDto }),
  );
}

export function DeletePermanentlyProductDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({
      summary:
        'Borra el producto para siempre, con sus fotos (no se puede deshacer)',
    }),
    ApiNoContentResponse(),
  );
}
