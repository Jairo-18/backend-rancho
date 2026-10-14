import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ROOM_LABELS, type RoomLabel } from '../constants/settings.defaults.js';

/** Permite "" para vaciar un campo; cualquier otro valor se valida. */
const isFilled = (_: object, value: unknown): boolean => value !== '';

// --- Respuesta ---

export class SocialLinksDto {
  instagram: string;
  facebook: string;
  tiktok: string;
}

export class SettingsDto {
  hotelName: string;
  /** URL absoluta del logo; "" si no hay. */
  logoUrl: string;
  /** @example "Cabañas" */
  roomLabel: RoomLabel;
  /** @example "573001234567" */
  whatsappNumber: string;
  whatsappGreeting: string;
  fridayNightIsWeekend: boolean;
  address: string;
  city: string;
  mapsUrl: string;
  email: string;
  phone: string;
  socials: SocialLinksDto;
  /** @example "3:00 p. m." */
  checkInTime: string;
  /** @example "12:00 m." */
  checkOutTime: string;
  sharedAreas: string;
  petsPolicy: string;
  recommendations: string[];
  houseRules: string[];
  /** Cada elemento "Título: texto". */
  bookingTerms: string[];
}

// --- Actualización (parcial: solo se guardan las claves enviadas) ---

export class UpdateSocialLinksDto {
  @IsOptional()
  @ValidateIf(isFilled)
  @IsUrl({ require_protocol: true })
  instagram?: string;

  @IsOptional()
  @ValidateIf(isFilled)
  @IsUrl({ require_protocol: true })
  facebook?: string;

  @IsOptional()
  @ValidateIf(isFilled)
  @IsUrl({ require_protocol: true })
  tiktok?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  hotelName?: string;

  @IsOptional()
  @IsIn(ROOM_LABELS)
  roomLabel?: RoomLabel;

  /** Solo dígitos con indicativo de país. @example "573001234567" */
  @IsOptional()
  @ValidateIf(isFilled)
  @Matches(/^\d{10,15}$/, {
    message:
      'whatsappNumber debe tener solo dígitos con indicativo de país, ej. 573001234567',
  })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  whatsappGreeting?: string;

  @IsOptional()
  @IsBoolean()
  fridayNightIsWeekend?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @ValidateIf(isFilled)
  @IsUrl({ require_protocol: true })
  mapsUrl?: string;

  @IsOptional()
  @ValidateIf(isFilled)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSocialLinksDto)
  socials?: UpdateSocialLinksDto;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  checkInTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  sharedAreas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  petsPolicy?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(400, { each: true })
  recommendations?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(400, { each: true })
  houseRules?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(400, { each: true })
  bookingTerms?: string[];
}
