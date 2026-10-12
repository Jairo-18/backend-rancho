import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../shared/utils/slug.js';

export const MAX_ROOM_PRICE = 50_000_000;

/** La habitación se crea inactiva: se activa al tener al menos 3 fotos. */
export class CreateRoomDto {
  /** @example "Cabaña del Roble" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  /** Si se omite se genera a partir del nombre. @example "cabana-del-roble" */
  @IsOptional()
  @MaxLength(SLUG_MAX_LENGTH)
  @Matches(SLUG_PATTERN, {
    message: 'slug solo admite minúsculas, números y guiones',
  })
  slug?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsBoolean()
  hasJacuzzi?: boolean;

  /** Personas; null = no se muestra. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number | null;

  /** COP por noche, lunes a viernes. @example 280000 */
  @IsInt()
  @Min(0)
  @Max(MAX_ROOM_PRICE)
  weekdayPrice: number;

  /** COP por noche, sábado y domingo. @example 350000 */
  @IsInt()
  @Min(0)
  @Max(MAX_ROOM_PRICE)
  weekendPrice: number;
}
