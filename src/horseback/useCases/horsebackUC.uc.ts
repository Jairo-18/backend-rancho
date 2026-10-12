import { Injectable } from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type {
  CreateHorsebackDto,
  HorsebackDto,
  ReorderHorsebackImagesDto,
  UpdateHorsebackDto,
} from '../dtos/horseback.dto.js';
import { HorsebackService } from '../services/horseback.service.js';
import { HorsebackImageService } from '../services/horsebackImage.service.js';

@Injectable()
export class HorsebackUC {
  constructor(
    private readonly _horsebackService: HorsebackService,
    private readonly _horsebackImageService: HorsebackImageService,
  ) {}

  findPublic(): Promise<HorsebackDto[]> {
    return this._horsebackService.findPublic();
  }

  findPublicBySlug(slug: string): Promise<HorsebackDto> {
    return this._horsebackService.findPublicBySlug(slug);
  }

  findAdmin(query: AdminListQueryDto): Promise<HorsebackDto[]> {
    return this._horsebackService.findAdmin(query);
  }

  findById(id: string): Promise<HorsebackDto> {
    return this._horsebackService.findById(id);
  }

  create(dto: CreateHorsebackDto): Promise<HorsebackDto> {
    return this._horsebackService.create(dto);
  }

  update(id: string, dto: UpdateHorsebackDto): Promise<HorsebackDto> {
    return this._horsebackService.update(id, dto);
  }

  deactivate(id: string): Promise<void> {
    return this._horsebackService.deactivate(id);
  }

  async addImage(id: string, file: Buffer | undefined): Promise<HorsebackDto> {
    await this._horsebackImageService.add(id, file);
    return this._horsebackService.findById(id);
  }

  async removeImage(id: string, imageId: string): Promise<HorsebackDto> {
    await this._horsebackImageService.remove(id, imageId);
    return this._horsebackService.findById(id);
  }

  async reorderImages(
    id: string,
    dto: ReorderHorsebackImagesDto,
  ): Promise<HorsebackDto> {
    await this._horsebackImageService.reorder(id, dto);
    return this._horsebackService.findById(id);
  }
}
