import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import { AdminListQueryDto } from '../../shared/dtos/admin-list-query.dto.js';
import {
  CreateRoomDocs,
  DeleteRoomDocs,
  DeletePermanentlyRoomDocs,
  DeleteRoomImageDocs,
  FindAdminRoomsDocs,
  FindRoomByIdDocs,
  ReorderRoomImagesDocs,
  UpdateRoomDocs,
  UploadRoomImageDocs,
} from '../decorators/room.decorators.js';
import { CreateRoomDto } from '../dtos/createRoom.dto.js';
import { RoomDto } from '../dtos/room.dto.js';
import { ReorderRoomImagesDto } from '../dtos/roomImage.dto.js';
import { UpdateRoomDto } from '../dtos/updateRoom.dto.js';
import { RoomUC } from '../useCases/roomUC.uc.js';

/** Gestión de habitaciones desde el panel admin. */
@Controller('rooms')
@ApiTags('Habitaciones')
@AdminOnly()
export class RoomController {
  constructor(private readonly _roomUC: RoomUC) {}

  @Get('admin')
  @FindAdminRoomsDocs()
  findAll(@Query() query: AdminListQueryDto): Promise<RoomDto[]> {
    return this._roomUC.findAdmin(query);
  }

  @Get('admin/:id')
  @FindRoomByIdDocs()
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<RoomDto> {
    return this._roomUC.findById(id);
  }

  @Post()
  @CreateRoomDocs()
  create(@Body() dto: CreateRoomDto): Promise<RoomDto> {
    return this._roomUC.create(dto);
  }

  @Patch(':id')
  @UpdateRoomDocs()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomDto,
  ): Promise<RoomDto> {
    return this._roomUC.update(id, dto);
  }

  @Delete(':id')
  @DeleteRoomDocs()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._roomUC.deactivate(id);
  }

  @Delete(':id/permanent')
  @DeletePermanentlyRoomDocs()
  removePermanently(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._roomUC.remove(id);
  }

  @Post(':id/images')
  @UploadRoomImageDocs()
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<RoomDto> {
    return this._roomUC.addImage(id, file?.buffer);
  }

  @Patch(':id/images/reorder')
  @ReorderRoomImagesDocs()
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderRoomImagesDto,
  ): Promise<RoomDto> {
    return this._roomUC.reorderImages(id, dto);
  }

  @Delete(':id/images/:imageId')
  @DeleteRoomImageDocs()
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<RoomDto> {
    return this._roomUC.removeImage(id, imageId);
  }
}
