import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '../../shared/repositories/product.repository.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  PRODUCT_IMAGES_FOLDER,
  PRODUCT_NOT_FOUND,
} from '../constants/product.constants.js';

/** Foto principal del producto (una sola). */
@Injectable()
export class ProductImageService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _uploadsService: UploadsService,
  ) {}

  /** Pone o reemplaza la foto y borra la anterior del almacenamiento. */
  async set(productId: string, file: Buffer | undefined): Promise<void> {
    if (!file)
      throw new BadRequestException('Adjunta la foto en el campo "file"');
    const product = await this._productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);

    const [stored] = await this._uploadsService.storeImages(
      [file],
      PRODUCT_IMAGES_FOLDER,
    );
    try {
      await this._productRepository.update(
        { id: productId },
        { imageUrl: stored.url, imageStorageKey: stored.key },
      );
    } catch (error) {
      await this._uploadsService.deleteQuietly([stored.key]);
      throw error;
    }
    if (product.imageStorageKey) {
      await this._uploadsService.deleteQuietly([product.imageStorageKey]);
    }
  }
}
