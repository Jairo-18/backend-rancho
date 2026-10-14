import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity.js';
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

  /** Lo que incluye, como etiquetas ("Wifi", "2 desayunos"…). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  amenities: string[];

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

  /** Productos que se ofrecen junto con la habitación (vino, decoración…). */
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'room_products',
    joinColumn: { name: 'room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Relation<Product[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
