import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { PostItem } from './post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  postId: string;

  @Column()
  text: string;

  @Column()
  likes: number;
}
