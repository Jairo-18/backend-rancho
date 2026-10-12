import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { RoomImage } from './roomImage.entity.js';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 140 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  hasJacuzzi: boolean;

  @Column({ type: 'integer', nullable: true })
  capacity: number | null;

  /** COP por noche, lunes a viernes. */
  @Column({ type: 'integer' })
  weekdayPrice: number;

  /** COP por noche, sábado y domingo. */
  @Column({ type: 'integer' })
  weekendPrice: number;

  @Index()
  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => RoomImage, (image) => image.room)
  images: Relation<RoomImage[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
