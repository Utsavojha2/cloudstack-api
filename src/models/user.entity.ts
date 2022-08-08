import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserInfo } from './user-info.entity';

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

  @Column({
    default: false,
  })
  is_verified: boolean;

  @Column({ nullable: true })
  confirmAccountToken: string;

  @Column({ nullable: true })
  confirmAccountTokenExpiredAt: Date;

  @Column({ nullable: true })
  confirmAccountTokenUpdatedAt: Date;

  @Column()
  birthDate: Date;

  @OneToOne(() => UserInfo, (info) => info.user)
  userInfo: UserInfo;
}
