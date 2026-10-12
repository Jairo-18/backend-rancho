import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type { Room } from '../../shared/entities/room.entity.js';
import { RoomRepository } from '../../shared/repositories/room.repository.js';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { ilikeContains } from '../../shared/utils/ilike.js';
import { uniqueSlug } from '../../shared/utils/slug.js';
import { StorageService } from '../../uploads/services/storage.service.js';
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
    private readonly _storageService: StorageService,
  ) {}

  async findPublic(): Promise<RoomDto[]> {
    const rooms = await this._roomRepository.find({
      where: { isActive: true },
      relations: { images: true },
      order: { name: 'ASC' },
    });
    return rooms.map((room) => this.toDto(room));
  }

  async findPublicBySlug(slug: string): Promise<RoomDto> {
    const room = await this._roomRepository.findOne({
      where: { slug, isActive: true },
      relations: { images: true },
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

  /** Se crea inactiva: se activa al tener al menos 3 fotos. */
  async create(dto: CreateRoomDto): Promise<RoomDto> {
    const room = await this._roomRepository.save(
      this._roomRepository.create({
        name: dto.name.trim(),
        slug: await this.availableSlug(dto.slug ?? dto.name),
        description: dto.description.trim(),
        hasJacuzzi: dto.hasJacuzzi ?? false,
        capacity: dto.capacity ?? null,
        weekdayPrice: dto.weekdayPrice,
        weekendPrice: dto.weekendPrice,
        isActive: false,
      }),
    );
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
        `La habitación necesita al menos ${ROOM_MIN_IMAGES} fotos para activarse (tiene ${room.images.length})`,
      );
    }
    const { slug, name, description, ...rest } = dto;
    const changes: Partial<Room> = {
      ...definedOnly(rest),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(slug !== undefined &&
        slug !== room.slug && {
          slug: await this.availableSlug(slug, room.id),
        }),
    };
    if (Object.keys(changes).length > 0) {
      await this._roomRepository.update({ id }, changes);
    }
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

  private toDto(room: Room): RoomDto {
    return toRoomDto(room, (url) => this._storageService.publicUrl(url));
  }

  private async getOrFail(id: string): Promise<Room> {
    const room = await this._roomRepository.findOne({
      where: { id },
      relations: { images: true },
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
