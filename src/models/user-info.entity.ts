import {
  Column,
  Entity,
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
  profilePicture: IPicturePayload;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  coverPicture: IPicturePayload;

  @Column()
  role: string;

  @Column()
  countryCode: string;

  @Column({ nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true, default: null })
  jobHistory: ReadonlyArray<IEmploymentInfo>;

  @OneToOne(() => User, (user) => user.userInfo, {
    cascade: true,
  })
  @JoinColumn()
  user: User;
}
