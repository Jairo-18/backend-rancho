import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Horseback } from './horseback.entity.js';

@Entity('horseback_images')
@Index(['horsebackId', 'position'])
export class HorsebackImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  horsebackId: string;

  @ManyToOne(() => Horseback, (horseback) => horseback.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'horseback_id' })
  horseback: Relation<Horseback>;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 300 })
  storageKey: string;

  @Column({ type: 'smallint', default: 0 })
  position: number;
}
