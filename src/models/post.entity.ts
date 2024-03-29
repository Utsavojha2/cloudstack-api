import {
  PostStatus,
  PostVersion,
  PostVisibility,
} from 'src/modules/post/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class PostItem {
  constructor(props?: Partial<PostItem>) {
    if (props) {
      Object.assign(this, props);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column({
    type: 'uuid',
  })
  postId: string;

  @Column()
  content: string;

  @Column({ default: 0 })
  likes: number;

  @Column({
    type: 'jsonb',
    array: true,
    nullable: true,
  })
  comments: ReadonlyArray<Comment>;

  @Column('simple-array', { nullable: true })
  photoIds: ReadonlyArray<string>;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostVersion,
  })
  version: PostVersion;

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
