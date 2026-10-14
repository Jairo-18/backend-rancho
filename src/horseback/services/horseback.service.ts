import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type { Horseback } from '../../shared/entities/horseback.entity.js';
import { HorsebackRepository } from '../../shared/repositories/horseback.repository.js';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { ilikeContains } from '../../shared/utils/ilike.js';
import { uniqueSlug } from '../../shared/utils/slug.js';
import { StorageService } from '../../uploads/services/storage.service.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  HORSEBACK_MIN_IMAGES,
  HORSEBACK_NOT_FOUND,
} from '../constants/horseback.constants.js';
import {
  type CreateHorsebackDto,
  type HorsebackDto,
  toHorsebackDto,
  type UpdateHorsebackDto,
} from '../dtos/horseback.dto.js';

@Injectable()
export class HorsebackService {
  constructor(
    private readonly _horsebackRepository: HorsebackRepository,
    private readonly _storageService: StorageService,
    private readonly _uploadsService: UploadsService,
  ) {}

  async findPublic(): Promise<HorsebackDto[]> {
    const rides = await this._horsebackRepository.find({
      where: { isActive: true },
      relations: { images: true },
      order: { name: 'ASC' },
    });
    return rides.map((ride) => this.toDto(ride));
  }

  async findPublicBySlug(slug: string): Promise<HorsebackDto> {
    const ride = await this._horsebackRepository.findOne({
      where: { slug, isActive: true },
      relations: { images: true },
    });
    if (!ride) throw new NotFoundException(HORSEBACK_NOT_FOUND);
    return this.toDto(ride);
  }

  async findAdmin({
    search,
    status = 'all',
  }: AdminListQueryDto): Promise<HorsebackDto[]> {
    const query = this._horsebackRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.images', 'image')
      .orderBy('ride.createdAt', 'DESC');
    if (status !== 'all') {
      query.andWhere('ride.isActive = :isActive', {
        isActive: status === 'active',
      });
    }
    if (search?.trim()) {
      query.andWhere('(ride.name ILIKE :search OR ride.slug ILIKE :search)', {
        search: ilikeContains(search),
      });
    }
    return (await query.getMany()).map((ride) => this.toDto(ride));
  }

  async findById(id: string): Promise<HorsebackDto> {
    return this.toDto(await this.getOrFail(id));
  }

  /** Se crea inactiva: se activa al tener al menos 1 foto. */
  async create(dto: CreateHorsebackDto): Promise<HorsebackDto> {
    const ride = await this._horsebackRepository.save(
      this._horsebackRepository.create({
        name: dto.name.trim(),
        slug: await this.availableSlug(dto.slug ?? dto.name),
        description: dto.description.trim(),
        durationMinutes: dto.durationMinutes,
        pricePerPerson: dto.pricePerPerson ?? null,
        schedule: dto.schedule?.trim() || null,
        isActive: false,
      }),
    );
    return this.findById(ride.id);
  }

  async update(id: string, dto: UpdateHorsebackDto): Promise<HorsebackDto> {
    const ride = await this.getOrFail(id);
    if (
      dto.isActive === true &&
      !ride.isActive &&
      ride.images.length < HORSEBACK_MIN_IMAGES
    ) {
      throw new BadRequestException(
        'La cabalgata necesita al menos una foto para activarse',
      );
    }
    const { slug, name, description, schedule, ...rest } = dto;
    const changes: Partial<Horseback> = {
      ...definedOnly(rest),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(schedule !== undefined && { schedule: schedule?.trim() || null }),
      ...(slug !== undefined &&
        slug !== ride.slug && {
          slug: await this.availableSlug(slug, ride.id),
        }),
    };
    if (Object.keys(changes).length > 0) {
      await this._horsebackRepository.update({ id }, changes);
    }
    return this.findById(id);
  }

  /** Borrado lógico: desactiva la cabalgata. */
  async deactivate(id: string): Promise<void> {
    const result = await this._horsebackRepository.update(
      { id },
      { isActive: false },
    );
    if (!result.affected) throw new NotFoundException(HORSEBACK_NOT_FOUND);
  }

  /**
   * Borrado definitivo: la fila y, en cascada, sus fotos y vínculos; luego los
   * archivos de las fotos en el almacenamiento.
   */
  async remove(id: string): Promise<void> {
    const entity = await this._horsebackRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!entity) throw new NotFoundException(HORSEBACK_NOT_FOUND);
    const keys = entity.images.map((image) => image.storageKey);
    await this._horsebackRepository.delete({ id });
    await this._uploadsService.deleteQuietly(keys);
  }

  private toDto(ride: Horseback): HorsebackDto {
    return toHorsebackDto(ride, (url) => this._storageService.publicUrl(url));
  }

  private async getOrFail(id: string): Promise<Horseback> {
    const ride = await this._horsebackRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!ride) throw new NotFoundException(HORSEBACK_NOT_FOUND);
    return ride;
  }

  private availableSlug(base: string, ignoreId?: string): Promise<string> {
    return uniqueSlug(base, async (slug) => {
      const owner = await this._horsebackRepository.findOne({
        where: { slug },
        select: { id: true },
      });
      return owner !== null && owner.id !== ignoreId;
    });
  }
}
