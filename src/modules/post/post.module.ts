import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostItem } from 'src/models/post.entity';
import { CloudinaryModule } from '../storage/storage.module';
import { PostController } from './http/controller/post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostItem]), CloudinaryModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
