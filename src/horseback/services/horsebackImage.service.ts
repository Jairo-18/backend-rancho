import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { Horseback } from '../../shared/entities/horseback.entity.js';
import { HorsebackImage } from '../../shared/entities/horsebackImage.entity.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  HORSEBACK_IMAGES_FOLDER,
  HORSEBACK_MAX_IMAGES,
  HORSEBACK_MIN_IMAGES,
  HORSEBACK_NOT_FOUND,
} from '../constants/horseback.constants.js';
import type { ReorderHorsebackImagesDto } from '../dtos/horseback.dto.js';

/** Fotos de las cabalgatas: entre 1 y 5, en orden (la primera es la portada). */
@Injectable()
export class HorsebackImageService {
  constructor(
    private readonly _dataSource: DataSource,
    private readonly _uploadsService: UploadsService,
  ) {}

  async add(horsebackId: string, file: Buffer | undefined): Promise<void> {
    if (!file)
      throw new BadRequestException('Adjunta la foto en el campo "file"');
    await this.assertCapacity(this._dataSource.manager, horsebackId);
    const [stored] = await this._uploadsService.storeImages(
      [file],
      HORSEBACK_IMAGES_FOLDER,
    );
    try {
      await this._dataSource.transaction(async (manager) => {
        const existing = await this.assertCapacity(manager, horsebackId, true);
        await manager.getRepository(HorsebackImage).insert({
          horsebackId,
          url: stored.url,
          storageKey: stored.key,
          position: existing.length,
        });
        // La primera foto la publica.
        if (existing.length === 0) {
          await manager
            .getRepository(Horseback)
            .update({ id: horsebackId }, { isActive: true });
        }
      });
    } catch (error) {
      await this._uploadsService.deleteQuietly([stored.key]);
      throw error;
    }
  }

  async remove(horsebackId: string, imageId: string): Promise<void> {
    const storageKey = await this._dataSource.transaction(async (manager) => {
      const ride = await this.lock(manager, horsebackId);
      const images = await this.imagesOf(manager, horsebackId);
      const image = images.find((candidate) => candidate.id === imageId);
      if (!image) throw new NotFoundException('Foto no encontrada');
      // Sin fotos no se puede mostrar: si era la última, queda oculta.
      if (ride.isActive && images.length - 1 < HORSEBACK_MIN_IMAGES) {
        await manager
          .getRepository(Horseback)
          .update({ id: horsebackId }, { isActive: false });
      }
      await manager.getRepository(HorsebackImage).delete({ id: imageId });
      await this.applyOrder(
        manager,
        images.filter((candidate) => candidate.id !== imageId),
      );
      return image.storageKey;
    });
    await this._uploadsService.deleteQuietly([storageKey]);
  }

  async reorder(
    horsebackId: string,
    dto: ReorderHorsebackImagesDto,
  ): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await this.lock(manager, horsebackId);
      const images = await this.imagesOf(manager, horsebackId);
      const byId = new Map(images.map((image) => [image.id, image]));
      if (
        dto.imageIds.length !== images.length ||
        dto.imageIds.some((id) => !byId.has(id))
      ) {
        throw new BadRequestException(
          'imageIds debe incluir exactamente todas las fotos',
        );
      }
      await this.applyOrder(
        manager,
        dto.imageIds.map((id) => byId.get(id) as HorsebackImage),
      );
    });
  }

  private async lock(manager: EntityManager, id: string): Promise<Horseback> {
    const ride = await manager
      .getRepository(Horseback)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!ride) throw new NotFoundException(HORSEBACK_NOT_FOUND);
    return ride;
  }

  private imagesOf(
    manager: EntityManager,
    horsebackId: string,
  ): Promise<HorsebackImage[]> {
    return manager
      .getRepository(HorsebackImage)
      .find({ where: { horsebackId }, order: { position: 'ASC' } });
  }

  private async assertCapacity(
    manager: EntityManager,
    id: string,
    lock = false,
  ): Promise<HorsebackImage[]> {
    if (lock) {
      await this.lock(manager, id);
    } else if (!(await manager.getRepository(Horseback).existsBy({ id }))) {
      throw new NotFoundException(HORSEBACK_NOT_FOUND);
    }
    const existing = await this.imagesOf(manager, id);
    if (existing.length >= HORSEBACK_MAX_IMAGES) {
      throw new BadRequestException(
        `Máximo ${HORSEBACK_MAX_IMAGES} fotos por cabalgata`,
      );
    }
    return existing;
  }

  private async applyOrder(
    manager: EntityManager,
    ordered: HorsebackImage[],
  ): Promise<void> {
    const repository = manager.getRepository(HorsebackImage);
    // Secuencial: dentro de una transacción todas las consultas comparten conexión.
    for (const [position, image] of ordered.entries()) {
      await repository.update({ id: image.id }, { position });
    }
  }
}
