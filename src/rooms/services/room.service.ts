import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In } from 'typeorm';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type { Room } from '../../shared/entities/room.entity.js';
import { ProductRepository } from '../../shared/repositories/product.repository.js';
import { RoomRepository } from '../../shared/repositories/room.repository.js';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { ilikeContains } from '../../shared/utils/ilike.js';
import { uniqueSlug } from '../../shared/utils/slug.js';
import { StorageService } from '../../uploads/services/storage.service.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  ROOM_MIN_IMAGES,
  ROOM_NOT_FOUND,
} from '../constants/room.constants.js';
import type { CreateRoomDto } from '../dtos/createRoom.dto.js';
import { type RoomDto, toRoomDto } from '../dtos/room.dto.js';
import type { UpdateRoomDto } from '../dtos/updateRoom.dto.js';

@Injectable()
export class RoomService {
  constructor(
    private readonly _roomRepository: RoomRepository,
    private readonly _productRepository: ProductRepository,
    private readonly _storageService: StorageService,
    private readonly _uploadsService: UploadsService,
  ) {}

  async findPublic(): Promise<RoomDto[]> {
    const rooms = await this._roomRepository.find({
      where: { isActive: true },
      relations: { images: true, products: true },
      order: { name: 'ASC' },
    });
    return rooms.map((room) => this.toDto(room));
  }

  async findPublicBySlug(slug: string): Promise<RoomDto> {
    const room = await this._roomRepository.findOne({
      where: { slug, isActive: true },
      relations: { images: true, products: true },
    });
    if (!room) throw new NotFoundException(ROOM_NOT_FOUND);
    return this.toDto(room);
  }

  async findAdmin({
    search,
    status = 'all',
  }: AdminListQueryDto): Promise<RoomDto[]> {
    const query = this._roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'image')
      .leftJoinAndSelect('room.products', 'product')
      .orderBy('room.createdAt', 'DESC');
    if (status !== 'all') {
      query.andWhere('room.isActive = :isActive', {
        isActive: status === 'active',
      });
    }
    if (search?.trim()) {
      query.andWhere('(room.name ILIKE :search OR room.slug ILIKE :search)', {
        search: ilikeContains(search),
      });
    }
    return (await query.getMany()).map((room) => this.toDto(room));
  }

  async findById(id: string): Promise<RoomDto> {
    return this.toDto(await this.getOrFail(id));
  }

  /** Se crea inactiva: se activa sola al subir la primera foto. */
  async create(dto: CreateRoomDto): Promise<RoomDto> {
    const room = await this._roomRepository.save(
      this._roomRepository.create({
        name: dto.name.trim(),
        slug: await this.availableSlug(dto.slug ?? dto.name),
        description: dto.description.trim(),
        hasJacuzzi: dto.hasJacuzzi ?? false,
        amenities: cleanAmenities(dto.amenities ?? []),
        capacity: dto.capacity ?? null,
        weekdayPrice: dto.weekdayPrice,
        weekendPrice: dto.weekendPrice,
        isActive: false,
      }),
    );
    if (dto.productIds) await this.setProducts(room.id, dto.productIds);
    return this.findById(room.id);
  }

  async update(id: string, dto: UpdateRoomDto): Promise<RoomDto> {
    const room = await this.getOrFail(id);
    if (
      dto.isActive === true &&
      !room.isActive &&
      room.images.length < ROOM_MIN_IMAGES
    ) {
      throw new BadRequestException(
        `La habitación necesita al menos ${ROOM_MIN_IMAGES} foto para activarse`,
      );
    }
    const { slug, name, description, productIds, amenities, ...rest } = dto;
    const changes: Partial<Room> = {
      ...definedOnly(rest),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(amenities !== undefined && { amenities: cleanAmenities(amenities) }),
      ...(slug !== undefined &&
        slug !== room.slug && {
          slug: await this.availableSlug(slug, room.id),
        }),
    };
    if (Object.keys(changes).length > 0) {
      await this._roomRepository.update({ id }, changes);
    }
    if (productIds) await this.setProducts(id, productIds);
    return this.findById(id);
  }

  /** Borrado lógico: la habitación queda inactiva (CONTEXT §4). */
  async deactivate(id: string): Promise<void> {
    const result = await this._roomRepository.update(
      { id },
      { isActive: false },
    );
    if (!result.affected) throw new NotFoundException(ROOM_NOT_FOUND);
  }

  /**
   * Borrado definitivo: la fila y, en cascada, sus fotos y vínculos; luego los
   * archivos de las fotos en el almacenamiento.
   */
  async remove(id: string): Promise<void> {
    const entity = await this._roomRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!entity) throw new NotFoundException(ROOM_NOT_FOUND);
    const keys = entity.images.map((image) => image.storageKey);
    await this._roomRepository.delete({ id });
    await this._uploadsService.deleteQuietly(keys);
  }

  private toDto(room: Room): RoomDto {
    return toRoomDto(room, (url) => this._storageService.publicUrl(url));
  }

  /** Reemplaza la lista de productos sugeridos; ignora ids que no existan. */
  private async setProducts(
    roomId: string,
    productIds: string[],
  ): Promise<void> {
    const ids = [...new Set(productIds)];
    const products = ids.length
      ? await this._productRepository.find({
          where: { id: In(ids) },
          select: { id: true },
        })
      : [];
    const current = await this._roomRepository
      .createQueryBuilder()
      .relation('products')
      .of(roomId)
      .loadMany<{ id: string }>();
    await this._roomRepository
      .createQueryBuilder()
      .relation('products')
      .of(roomId)
      .addAndRemove(
        products.map((product) => product.id),
        current.map((product) => product.id),
      );
  }

  private async getOrFail(id: string): Promise<Room> {
    const room = await this._roomRepository.findOne({
      where: { id },
      relations: { images: true, products: true },
    });
    if (!room) throw new NotFoundException(ROOM_NOT_FOUND);
    return room;
  }

  private availableSlug(base: string, ignoreId?: string): Promise<string> {
    return uniqueSlug(base, async (slug) => {
      const owner = await this._roomRepository.findOne({
        where: { slug },
        select: { id: true },
      });
      return owner !== null && owner.id !== ignoreId;
    });
  }
}

/** Etiquetas sin espacios sobrantes, sin vacías y sin repetidas (ignorando mayúsculas). */
function cleanAmenities(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const value = item.replace(/\s+/g, ' ').trim();
    const key = value.toLocaleLowerCase('es');
    if (value && !seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}
