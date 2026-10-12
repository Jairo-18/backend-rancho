import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  FindPublicHorsebackDocs,
  FindPublicHorsebackListDocs,
} from '../decorators/horseback.decorators.js';
import { HorsebackDto } from '../dtos/horseback.dto.js';
import { HorsebackUC } from '../useCases/horsebackUC.uc.js';

@Controller('horseback')
@ApiTags('Cabalgatas (público)')
export class HorsebackPublicController {
  constructor(private readonly _horsebackUC: HorsebackUC) {}

  @Get()
  @FindPublicHorsebackListDocs()
  findAll(): Promise<HorsebackDto[]> {
    return this._horsebackUC.findPublic();
  }

  @Get(':slug')
  @FindPublicHorsebackDocs()
  findBySlug(@Param('slug') slug: string): Promise<HorsebackDto> {
    return this._horsebackUC.findPublicBySlug(slug);
  }
}
