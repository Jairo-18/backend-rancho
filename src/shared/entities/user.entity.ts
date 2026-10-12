import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  Admin = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.Admin,
  })
  role: UserRole;

  /** SHA-256 del refresh token vigente; null = sesión cerrada. */
  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  refreshTokenHash: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
