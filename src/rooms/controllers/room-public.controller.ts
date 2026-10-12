import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  FindPublicRoomDocs,
  FindPublicRoomsDocs,
} from '../decorators/room.decorators.js';
import { RoomDto } from '../dtos/room.dto.js';
import { RoomUC } from '../useCases/roomUC.uc.js';

@Controller('rooms')
@ApiTags('Habitaciones (público)')
export class RoomPublicController {
  constructor(private readonly _roomUC: RoomUC) {}

  @Get()
  @FindPublicRoomsDocs()
  findAll(): Promise<RoomDto[]> {
    return this._roomUC.findPublic();
  }

  @Get(':slug')
  @FindPublicRoomDocs()
  findBySlug(@Param('slug') slug: string): Promise<RoomDto> {
    return this._roomUC.findPublicBySlug(slug);
  }
}
