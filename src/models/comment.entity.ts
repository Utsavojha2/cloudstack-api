import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  postId: Post;

  @Column()
  text: string;

  @Column()
  likes: number;
}
