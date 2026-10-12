import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Room } from './room.entity.js';

@Entity('room_images')
@Index(['roomId', 'position'])
export class RoomImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @ManyToOne(() => Room, (room) => room.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Relation<Room>;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  /** Clave en el StorageService (para borrar el archivo). */
  @Column({ type: 'varchar', length: 300 })
  storageKey: string;

  @Column({ type: 'boolean', default: false })
  isCover: boolean;

  @Column({ type: 'smallint', default: 0 })
  position: number;
}
