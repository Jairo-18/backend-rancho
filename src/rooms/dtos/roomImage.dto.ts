import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ROOM_MAX_IMAGES } from '../constants/room.constants.js';

export class ReorderRoomImagesDto {
  /** Todos los ids de las fotos de la habitación, en el nuevo orden. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ROOM_MAX_IMAGES)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  imageIds: string[];

  /** Foto de portada. Si se omite se conserva la actual. */
  @IsOptional()
  @IsUUID('all')
  coverImageId?: string;
}
