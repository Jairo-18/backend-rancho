import {
  type ProductDto,
  toProductDto,
} from '../../products/dtos/product.dto.js';
import type { RoomImage } from '../../shared/entities/roomImage.entity.js';
import type { Room } from '../../shared/entities/room.entity.js';
import type { UrlResolver } from '../../shared/interfaces/url-resolver.interface.js';

export class RoomImageDto {
  id: string;
  url: string;
  isCover: boolean;
  position: number;
}

export class RoomDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasJacuzzi: boolean;
  /** Lo que incluye (etiquetas). */
  amenities: string[];
  capacity: number | null;
  /** COP por noche, lunes a viernes. */
  weekdayPrice: number;
  /** COP por noche, sábado y domingo. */
  weekendPrice: number;
  isActive: boolean;
  coverImageUrl: string | null;
  /** Ordenadas por `position`. */
  images: RoomImageDto[];
  /** Ids de todos los productos asociados (para el panel). */
  productIds: string[];
  /** Productos asociados que están activos (para el sitio). */
  products: ProductDto[];
  createdAt: Date;
  updatedAt: Date;
}

export function toRoomImageDto(
  image: RoomImage,
  resolveUrl: UrlResolver,
): RoomImageDto {
  return {
    id: image.id,
    url: resolveUrl(image.url),
    isCover: image.isCover,
    position: image.position,
  };
}

export function toRoomDto(room: Room, resolveUrl: UrlResolver): RoomDto {
  const images = [...(room.images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => toRoomImageDto(image, resolveUrl));
  return {
    id: room.id,
    name: room.name,
    slug: room.slug,
    description: room.description,
    hasJacuzzi: room.hasJacuzzi,
    amenities: room.amenities ?? [],
    capacity: room.capacity,
    weekdayPrice: room.weekdayPrice,
    weekendPrice: room.weekendPrice,
    isActive: room.isActive,
    coverImageUrl:
      (images.find((image) => image.isCover) ?? images[0])?.url ?? null,
    images,
    productIds: (room.products ?? []).map((product) => product.id),
    products: (room.products ?? [])
      .filter((product) => product.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map((product) => toProductDto(product, resolveUrl)),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}
