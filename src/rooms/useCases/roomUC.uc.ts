import { Injectable } from '@nestjs/common';
import type { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import type { CreateRoomDto } from '../dtos/createRoom.dto.js';
import type { RoomDto } from '../dtos/room.dto.js';
import type { ReorderRoomImagesDto } from '../dtos/roomImage.dto.js';
import type { UpdateRoomDto } from '../dtos/updateRoom.dto.js';
import { RoomService } from '../services/room.service.js';
import { RoomImageService } from '../services/roomImage.service.js';

@Injectable()
export class RoomUC {
  constructor(
    private readonly _roomService: RoomService,
    private readonly _roomImageService: RoomImageService,
  ) {}

  findPublic(): Promise<RoomDto[]> {
    return this._roomService.findPublic();
  }

  findPublicBySlug(slug: string): Promise<RoomDto> {
    return this._roomService.findPublicBySlug(slug);
  }

  findAdmin(query: AdminListQueryDto): Promise<RoomDto[]> {
    return this._roomService.findAdmin(query);
  }

  findById(id: string): Promise<RoomDto> {
    return this._roomService.findById(id);
  }

  create(dto: CreateRoomDto): Promise<RoomDto> {
    return this._roomService.create(dto);
  }

  update(id: string, dto: UpdateRoomDto): Promise<RoomDto> {
    return this._roomService.update(id, dto);
  }

  deactivate(id: string): Promise<void> {
    return this._roomService.deactivate(id);
  }

  remove(id: string): Promise<void> {
    return this._roomService.remove(id);
  }

  async addImage(id: string, file: Buffer | undefined): Promise<RoomDto> {
    await this._roomImageService.add(id, file);
    return this._roomService.findById(id);
  }

  async removeImage(id: string, imageId: string): Promise<RoomDto> {
    await this._roomImageService.remove(id, imageId);
    return this._roomService.findById(id);
  }

  async reorderImages(id: string, dto: ReorderRoomImagesDto): Promise<RoomDto> {
    await this._roomImageService.reorder(id, dto);
    return this._roomService.findById(id);
  }
}
