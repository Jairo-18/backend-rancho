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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import {
  CreatePriceRuleDocs,
  DeletePriceRuleDocs,
  FindPriceRuleDocs,
  FindPriceRulesDocs,
  UpdatePriceRuleDocs,
} from '../decorators/priceRule.decorators.js';
import {
  CreatePriceRuleDto,
  PriceRuleDto,
  PriceRuleQueryDto,
  UpdatePriceRuleDto,
} from '../dtos/priceRule.dto.js';
import { PriceRuleUC } from '../useCases/priceRuleUC.uc.js';

/** Reglas especiales por fechas (festivos, temporadas, puentes). Solo panel admin. */
@Controller('price-rules')
@ApiTags('Reglas de precio')
@AdminOnly()
export class PriceRuleController {
  constructor(private readonly _priceRuleUC: PriceRuleUC) {}

  @Get()
  @FindPriceRulesDocs()
  findAll(@Query() query: PriceRuleQueryDto): Promise<PriceRuleDto[]> {
    return this._priceRuleUC.findAll(query);
  }

  @Get(':id')
  @FindPriceRuleDocs()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PriceRuleDto> {
    return this._priceRuleUC.findOne(id);
  }

  @Post()
  @CreatePriceRuleDocs()
  create(@Body() dto: CreatePriceRuleDto): Promise<PriceRuleDto> {
    return this._priceRuleUC.create(dto);
  }

  @Patch(':id')
  @UpdatePriceRuleDocs()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceRuleDto,
  ): Promise<PriceRuleDto> {
    return this._priceRuleUC.update(id, dto);
  }

  @Delete(':id')
  @DeletePriceRuleDocs()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this._priceRuleUC.remove(id);
  }
}
