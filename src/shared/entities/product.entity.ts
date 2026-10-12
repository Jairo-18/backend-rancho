import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 140 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  /** COP. */
  @Column({ type: 'integer' })
  price: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  imageStorageKey: string | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
