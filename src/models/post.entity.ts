import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';

export enum PostStatus {
  PUBLISHED = 'published',
  DRAFT = 'drafted',
  UNPUBLISHED = 'unpublished',
}

export enum PostVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PARITAL_PUBLIC = 'partial-public',
}

@Entity()
export class PostItem {
  constructor(props?: Partial<PostItem>) {
    if (props) {
      Object.assign(this, props);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  likes: number;

  @Column('simple-array', { nullable: true })
  comments: ReadonlyArray<Comment>;

  @Column('simple-array', { nullable: true })
  photos: ReadonlyArray<string>;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostVisibility,
  })
  visibility: PostVisibility;

  @Column()
  @Index()
  userId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
