import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRoomDto } from './createRoom.dto.js';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  /** Solo se puede activar con al menos 3 fotos. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
