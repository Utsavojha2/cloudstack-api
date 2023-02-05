import { validateOrReject } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity()
@Index(['userId', 'followerId'], { unique: true })
export class Follower {
  @PrimaryColumn({ type: 'uuid' })
  @Index()
  userId: string;

  @PrimaryColumn({
    type: 'uuid',
    comment: 'The userID of person who is being followed',
  })
  @Index()
  followerId: string;

  @CreateDateColumn()
  followedAt: Date;

  @Column({ default: null })
  unFollowedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    console.log('ran');
    await validateOrReject(this);
  }
}
