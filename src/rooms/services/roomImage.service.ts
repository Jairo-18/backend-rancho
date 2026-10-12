import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { Room } from '../../shared/entities/room.entity.js';
import { RoomImage } from '../../shared/entities/roomImage.entity.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  ROOM_IMAGES_FOLDER,
  ROOM_MAX_IMAGES,
  ROOM_MIN_IMAGES,
  ROOM_NOT_FOUND,
} from '../constants/room.constants.js';
import type { ReorderRoomImagesDto } from '../dtos/roomImage.dto.js';

/** Fotos de las habitaciones: entre 3 y 5, una portada, en orden. */
@Injectable()
export class RoomImageService {
  constructor(
    private readonly _dataSource: DataSource,
    private readonly _uploadsService: UploadsService,
  ) {}

  async add(roomId: string, file: Buffer | undefined): Promise<void> {
    if (!file)
      throw new BadRequestException('Adjunta la foto en el campo "file"');
    await this.assertCapacity(this._dataSource.manager, roomId);

    // Se procesa fuera de la transacción (sharp es lento) y se guarda antes de insertar la fila.
    const [stored] = await this._uploadsService.storeImages(
      [file],
      ROOM_IMAGES_FOLDER,
    );
    try {
      await this._dataSource.transaction(async (manager) => {
        // Se vuelve a validar con la fila bloqueada: dos subidas simultáneas no superan las 5.
        const existing = await this.assertCapacity(manager, roomId, true);
        await manager.getRepository(RoomImage).insert({
          roomId,
          url: stored.url,
          storageKey: stored.key,
          position: existing.length,
          isCover: !existing.some((image) => image.isCover),
        });
      });
    } catch (error) {
      await this._uploadsService.deleteQuietly([stored.key]);
      throw error;
    }
  }

  async remove(roomId: string, imageId: string): Promise<void> {
    const storageKey = await this._dataSource.transaction(async (manager) => {
      const room = await this.lockRoom(manager, roomId);
      const images = await this.imagesOf(manager, roomId);
      const image = images.find((candidate) => candidate.id === imageId);
      if (!image) throw new NotFoundException('Foto no encontrada');
      if (room.isActive && images.length - 1 < ROOM_MIN_IMAGES) {
        throw new BadRequestException(
          `Una habitación activa debe tener al menos ${ROOM_MIN_IMAGES} fotos. Sube otra antes de borrar esta o desactiva la habitación.`,
        );
      }
      await manager.getRepository(RoomImage).delete({ id: imageId });
      const remaining = images.filter((candidate) => candidate.id !== imageId);
      // Si se borra la portada, pasa a la primera restante.
      const coverId = image.isCover
        ? remaining[0]?.id
        : remaining.find((i) => i.isCover)?.id;
      await this.applyOrder(manager, remaining, coverId);
      return image.storageKey;
    });
    await this._uploadsService.deleteQuietly([storageKey]);
  }

  async reorder(roomId: string, dto: ReorderRoomImagesDto): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await this.lockRoom(manager, roomId);
      const images = await this.imagesOf(manager, roomId);
      const byId = new Map(images.map((image) => [image.id, image]));
      if (
        dto.imageIds.length !== images.length ||
        dto.imageIds.some((id) => !byId.has(id))
      ) {
        throw new BadRequestException(
          'imageIds debe incluir exactamente todas las fotos de la habitación',
        );
      }
      if (dto.coverImageId && !byId.has(dto.coverImageId)) {
        throw new BadRequestException(
          'coverImageId no pertenece a esta habitación',
        );
      }
      const ordered = dto.imageIds.map((id) => byId.get(id) as RoomImage);
      const coverId =
        dto.coverImageId ??
        images.find((image) => image.isCover)?.id ??
        ordered[0].id;
      await this.applyOrder(manager, ordered, coverId);
    });
  }

  private async lockRoom(manager: EntityManager, id: string): Promise<Room> {
    const room = await manager
      .getRepository(Room)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!room) throw new NotFoundException(ROOM_NOT_FOUND);
    return room;
  }

  private imagesOf(
    manager: EntityManager,
    roomId: string,
  ): Promise<RoomImage[]> {
    return manager
      .getRepository(RoomImage)
      .find({ where: { roomId }, order: { position: 'ASC' } });
  }

  private async assertCapacity(
    manager: EntityManager,
    roomId: string,
    lock = false,
  ): Promise<RoomImage[]> {
    if (lock) {
      await this.lockRoom(manager, roomId);
    } else if (!(await manager.getRepository(Room).existsBy({ id: roomId }))) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }
    const existing = await this.imagesOf(manager, roomId);
    if (existing.length >= ROOM_MAX_IMAGES) {
      throw new BadRequestException(
        `Máximo ${ROOM_MAX_IMAGES} fotos por habitación`,
      );
    }
    return existing;
  }

  /** Reescribe posiciones 0..n-1 y deja una sola portada. */
  private async applyOrder(
    manager: EntityManager,
    ordered: RoomImage[],
    coverId: string | undefined,
  ): Promise<void> {
    const repository = manager.getRepository(RoomImage);
    // Secuencial: dentro de una transacción todas las consultas comparten conexión.
    for (const [position, image] of ordered.entries()) {
      await repository.update(
        { id: image.id },
        { position, isCover: image.id === coverId },
      );
    }
  }
}
