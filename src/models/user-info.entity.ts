import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

interface ICountry {
  code: string;
  label: string;
}

interface IEmploymentInfo {
  positionName: string;
  companyName: string;
  startDate: Date;
  endDate: Date;
  isCurrentlyEmployedHere?: boolean;
}

@Entity()
export class UserInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  location: string;

  @Column()
  profilePictureId: string;

  @Column()
  coverImageId: string;

  @Column()
  role: string;

  @Column('jsonb')
  country: ICountry;

  @Column()
  bio: string;

  @Column('array', { nullable: true })
  jobHistory: ReadonlyArray<IEmploymentInfo>;

  @OneToOne(() => User, (user) => user.userInfo, {
    cascade: true,
  })
  user: User;
}
