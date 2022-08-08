import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

interface IEmploymentInfo {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  isCurrentlyWorkingHere?: boolean;
}

interface ICrop {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: string;
}

interface IPicturePayload {
  id: string;
  crop: ICrop | null;
}

export class EmploymentHistory {
  @Column()
  @Generated('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, default: null })
  endDate: Date | null;

  @Column({ default: false })
  isCurrentlyWorkingHere: boolean;
}

@Entity()
export class UserInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  location: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  profilePicture: IPicturePayload | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  coverPicture: IPicturePayload | null;

  @Column()
  role: string;

  @Column()
  countryCode: string;

  @Column({ nullable: true })
  bio: string;

  @Column('array', { nullable: true, default: null })
  jobHistory: ReadonlyArray<EmploymentHistory>;

  @OneToOne(() => User, (user) => user.userInfo, {
    cascade: true,
  })
  @JoinColumn()
  user: User;
}
