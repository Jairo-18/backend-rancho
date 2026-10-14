import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type { Product } from '../../shared/entities/product.entity.js';
import { ProductRepository } from '../../shared/repositories/product.repository.js';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { ilikeContains } from '../../shared/utils/ilike.js';
import { uniqueSlug } from '../../shared/utils/slug.js';
import { StorageService } from '../../uploads/services/storage.service.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import { PRODUCT_NOT_FOUND } from '../constants/product.constants.js';
import {
  type CreateProductDto,
  type ProductDto,
  toProductDto,
  type UpdateProductDto,
} from '../dtos/product.dto.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _storageService: StorageService,
    private readonly _uploadsService: UploadsService,
  ) {}

  async findPublic(): Promise<ProductDto[]> {
    const products = await this._productRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return products.map((product) => this.toDto(product));
  }

  async findPublicBySlug(slug: string): Promise<ProductDto> {
    const product = await this._productRepository.findOne({
      where: { slug, isActive: true },
    });
    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);
    return this.toDto(product);
  }

  async findAdmin({
    search,
    status = 'all',
  }: AdminListQueryDto): Promise<ProductDto[]> {
    const query = this._productRepository
      .createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC');
    if (status !== 'all') {
      query.andWhere('product.isActive = :isActive', {
        isActive: status === 'active',
      });
    }
    if (search?.trim()) {
      query.andWhere(
        '(product.name ILIKE :search OR product.slug ILIKE :search)',
        {
          search: ilikeContains(search),
        },
      );
    }
    return (await query.getMany()).map((product) => this.toDto(product));
  }

  async findById(id: string): Promise<ProductDto> {
    return this.toDto(await this.getOrFail(id));
  }

  /** Se crea inactivo: se activa al tener foto. */
  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = await this._productRepository.save(
      this._productRepository.create({
        name: dto.name.trim(),
        slug: await this.availableSlug(dto.slug ?? dto.name),
        description: dto.description.trim(),
        price: dto.price,
        isActive: false,
      }),
    );
    return this.findById(product.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.getOrFail(id);
    if (dto.isActive === true && !product.isActive && !product.imageUrl) {
      throw new BadRequestException(
        'El producto necesita una foto para activarse',
      );
    }
    const { slug, name, description, ...rest } = dto;
    const changes: Partial<Product> = {
      ...definedOnly(rest),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(slug !== undefined &&
        slug !== product.slug && {
          slug: await this.availableSlug(slug, product.id),
        }),
    };
    if (Object.keys(changes).length > 0) {
      await this._productRepository.update({ id }, changes);
    }
    return this.findById(id);
  }

  /** Borrado lógico: desactiva el producto. */
  async deactivate(id: string): Promise<void> {
    const result = await this._productRepository.update(
      { id },
      { isActive: false },
    );
    if (!result.affected) throw new NotFoundException(PRODUCT_NOT_FOUND);
  }

  /**
   * Borrado definitivo: la fila y, en cascada, sus fotos y vínculos; luego los
   * archivos de las fotos en el almacenamiento.
   */
  async remove(id: string): Promise<void> {
    const entity = await this._productRepository.findOne({
      where: { id },
    });
    if (!entity) throw new NotFoundException(PRODUCT_NOT_FOUND);
    const keys = entity.imageStorageKey ? [entity.imageStorageKey] : [];
    await this._productRepository.delete({ id });
    await this._uploadsService.deleteQuietly(keys);
  }

  private toDto(product: Product): ProductDto {
    return toProductDto(product, (url) => this._storageService.publicUrl(url));
  }

  private async getOrFail(id: string): Promise<Product> {
    const product = await this._productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);
    return product;
  }

  private availableSlug(base: string, ignoreId?: string): Promise<string> {
    return uniqueSlug(base, async (slug) => {
      const owner = await this._productRepository.findOne({
        where: { slug },
        select: { id: true },
      });
      return owner !== null && owner.id !== ignoreId;
    });
  }
}
