import { PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DESCRIPTION_MAX_LENGTH } from '../../shared/utils/description.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../shared/utils/slug.js';
import type { UrlResolver } from '../../shared/interfaces/url-resolver.interface.js';
import type { Horseback } from '../../shared/entities/horseback.entity.js';
import { HORSEBACK_MAX_IMAGES } from '../constants/horseback.constants.js';

export class HorsebackImageDto {
  id: string;
  url: string;
  position: number;
}

export class HorsebackDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  /** COP por persona; null = "Consultar precio". */
  pricePerPerson: number | null;
  /** Horarios o notas en texto libre. */
  schedule: string | null;
  isActive: boolean;
  /** La primera foto es la portada. */
  coverImageUrl: string | null;
  images: HorsebackImageDto[];
  createdAt: Date;
  updatedAt: Date;
}

export function toHorsebackDto(
  ride: Horseback,
  resolveUrl: UrlResolver,
): HorsebackDto {
  const images = [...(ride.images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      id: image.id,
      url: resolveUrl(image.url),
      position: image.position,
    }));
  return {
    id: ride.id,
    name: ride.name,
    slug: ride.slug,
    description: ride.description,
    durationMinutes: ride.durationMinutes,
    pricePerPerson: ride.pricePerPerson,
    schedule: ride.schedule,
    isActive: ride.isActive,
    coverImageUrl: images[0]?.url ?? null,
    images,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt,
  };
}

/** Se crea inactiva: se activa al tener al menos 1 foto. */
export class CreateHorsebackDto {
  /** @example "Cabalgata al atardecer" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

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

  /** @example 90 */
  @IsInt()
  @Min(10)
  @Max(1440)
  durationMinutes: number;

  /** COP por persona; null u omitido = "Consultar precio". */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  pricePerPerson?: number | null;

  /** @example "Todos los días a las 4:30 p. m." */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  schedule?: string | null;
}

export class UpdateHorsebackDto extends PartialType(CreateHorsebackDto) {
  /** Solo se puede activar con al menos 1 foto. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderHorsebackImagesDto {
  /** Todos los ids de las fotos, en el nuevo orden (la primera es la portada). */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(HORSEBACK_MAX_IMAGES)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  imageIds: string[];
}
