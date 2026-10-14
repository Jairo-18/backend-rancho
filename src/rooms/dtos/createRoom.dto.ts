import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsUUID,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DESCRIPTION_MAX_LENGTH } from '../../shared/utils/description.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../shared/utils/slug.js';

export const MAX_ROOM_PRICE = 50_000_000;

/** La habitación se crea inactiva y se activa sola al subir la primera foto. */
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
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description: string;

  /** Lo que incluye (wifi, jacuzzi, desayuno…): se muestran como etiquetas. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  amenities?: string[];

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

  /** Productos sugeridos con la habitación (se reemplaza la lista completa). */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('all', { each: true })
  productIds?: string[];
}
