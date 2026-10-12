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
  CreateHorsebackDocs,
  DeleteHorsebackDocs,
  DeleteHorsebackImageDocs,
  FindAdminHorsebackListDocs,
  FindHorsebackByIdDocs,
  ReorderHorsebackImagesDocs,
  UpdateHorsebackDocs,
  UploadHorsebackImageDocs,
} from '../decorators/horseback.decorators.js';
import {
  CreateHorsebackDto,
  HorsebackDto,
  ReorderHorsebackImagesDto,
  UpdateHorsebackDto,
} from '../dtos/horseback.dto.js';
import { HorsebackUC } from '../useCases/horsebackUC.uc.js';

/** Gestión de cabalgatas desde el panel admin. */
@Controller('horseback')
@ApiTags('Cabalgatas')
@AdminOnly()
export class HorsebackController {
  constructor(private readonly _horsebackUC: HorsebackUC) {}

  @Get('admin')
  @FindAdminHorsebackListDocs()
  findAll(@Query() query: AdminListQueryDto): Promise<HorsebackDto[]> {
    return this._horsebackUC.findAdmin(query);
  }

  @Get('admin/:id')
  @FindHorsebackByIdDocs()
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<HorsebackDto> {
    return this._horsebackUC.findById(id);
  }

  @Post()
  @CreateHorsebackDocs()
  create(@Body() dto: CreateHorsebackDto): Promise<HorsebackDto> {
    return this._horsebackUC.create(dto);
  }

  @Patch(':id')
  @UpdateHorsebackDocs()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHorsebackDto,
  ): Promise<HorsebackDto> {
    return this._horsebackUC.update(id, dto);
  }

  @Delete(':id')
  @DeleteHorsebackDocs()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._horsebackUC.deactivate(id);
  }

  @Post(':id/images')
  @UploadHorsebackImageDocs()
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<HorsebackDto> {
    return this._horsebackUC.addImage(id, file?.buffer);
  }

  @Patch(':id/images/reorder')
  @ReorderHorsebackImagesDocs()
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderHorsebackImagesDto,
  ): Promise<HorsebackDto> {
    return this._horsebackUC.reorderImages(id, dto);
  }

  @Delete(':id/images/:imageId')
  @DeleteHorsebackImageDocs()
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<HorsebackDto> {
    return this._horsebackUC.removeImage(id, imageId);
  }
}
