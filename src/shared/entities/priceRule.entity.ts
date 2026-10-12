import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './room.entity.js';

export enum PriceRuleType {
  /** `value` = precio fijo por noche en COP. */
  Fixed = 'FIXED',
  /** `value` = ajuste en % sobre el precio base de esa noche (p. ej. 20 = +20 %, -10 = -10 %). */
  Percent = 'PERCENT',
}

/** Regla especial por fechas (festivos, temporadas, puentes). Aplica a las noches entre startDate y endDate, ambas incluidas. */
@Entity('price_rules')
@Index(['startDate', 'endDate'])
@Check('"end_date" >= "start_date"')
export class PriceRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  /** Fecha de la primera noche (YYYY-MM-DD, calendario de Colombia). */
  @Column({ type: 'date' })
  startDate: string;

  /** Fecha de la última noche (YYYY-MM-DD), incluida. */
  @Column({ type: 'date' })
  endDate: string;

  /** null = aplica a todas las habitaciones. */
  @Column({ type: 'uuid', nullable: true })
  roomId: string | null;

  @ManyToOne(() => Room, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Relation<Room> | null;

  @Column({ type: 'enum', enum: PriceRuleType, enumName: 'price_rule_type' })
  type: PriceRuleType;

  @Column({ type: 'integer' })
  value: number;

  /** Mayor número = mayor prioridad cuando varias reglas cubren la misma noche. */
  @Column({ type: 'integer', default: 0 })
  priority: number;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
