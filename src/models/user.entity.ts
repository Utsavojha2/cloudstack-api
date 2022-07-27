import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column()
  is_verified: boolean;

  @Column({ nullable: true })
  confirmAccountToken: string;

  @Column({ nullable: true })
  confirmAccountTokenExpiredAt: Date;

  @Column({ nullable: true })
  confirmAccountTokenUpdatedAt: Date;

  @Column()
  birthDate: Date;
}
