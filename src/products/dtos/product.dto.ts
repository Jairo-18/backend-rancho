import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../shared/utils/slug.js';
import type { UrlResolver } from '../../shared/interfaces/url-resolver.interface.js';
import type { Product } from '../../shared/entities/product.entity.js';

export class ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** COP. */
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toProductDto(
  product: Product,
  resolveUrl: UrlResolver,
): ProductDto {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl ? resolveUrl(product.imageUrl) : null,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/** Se crea inactivo: se activa al tener foto. */
export class CreateProductDto {
  /** @example "Miel de abejas" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @MaxLength(SLUG_MAX_LENGTH)
  @Matches(SLUG_PATTERN, {
    message: 'slug solo admite minúsculas, números y guiones',
  })
  slug?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  /** COP. @example 28000 */
  @IsInt()
  @Min(0)
  @Max(50_000_000)
  price: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  /** Solo se puede activar con foto. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
