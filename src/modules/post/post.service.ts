import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostItem } from 'src/models/post.entity';
import { Repository } from 'typeorm';
import {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import { bufferToStream } from '../storage/storage.provider';
import { PublishPostRequest } from './http/request/publish-post.request';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostItem)
    private readonly postRepository: Repository<PostItem>,
  ) {}

  uploadImage(
    buffer: Buffer,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve) => {
      const upload = v2.uploader.upload_stream(options, (err, res) => {
        if (err) {
          throw new InternalServerErrorException(err.message);
        }
        resolve(res);
      });
      bufferToStream(buffer).pipe(upload);
    });
  }

  async savePost(post: PublishPostRequest, userId: string) {
    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(PostItem)
      .values({ ...post, userId })
      .execute();
  }
}
