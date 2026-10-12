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
import { HorsebackImage } from './horsebackImage.entity.js';

@Entity('horseback_rides')
export class Horseback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 140 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  durationMinutes: number;

  /** COP por persona; null = "Consultar precio". */
  @Column({ type: 'integer', nullable: true })
  pricePerPerson: number | null;

  /** Horarios o notas en texto libre. */
  @Column({ type: 'text', nullable: true })
  schedule: string | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => HorsebackImage, (image) => image.horseback)
  images: Relation<HorsebackImage[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
