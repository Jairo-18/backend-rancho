import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const STATUS_FILTERS = ['all', 'active', 'inactive'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Búsqueda + filtro activo/inactivo de las tablas del panel admin. */
export class AdminListQueryDto {
  /** Busca en nombre y slug. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(STATUS_FILTERS)
  status?: StatusFilter = 'all';
}
