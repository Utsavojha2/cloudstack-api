import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostItem, PostStatus } from 'src/models/post.entity';
import { Repository } from 'typeorm';
import {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import { bufferToStream } from '../storage/storage.provider';
import { PublishPostRequest } from './http/request/publish-post.request';
import { CreatePostRequest } from './http/request/create-post.request';

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

  async uploadPipedImages(
    uploadedImages: ReadonlyArray<Array<Record<string, Buffer>>>,
  ) {
    return await Promise.all(
      uploadedImages.map(async (images) => {
        const imageIds = await Promise.all(
          images.map(async (image) => {
            const [filename] = Object.keys(image);
            await this.uploadImage(image[filename], {
              public_id: filename,
            });
            return filename.split('_')[0];
          }),
        );
        const [id] = Array.from(new Set(imageIds));
        return id;
      }),
    );
  }

  async savePost(post: CreatePostRequest, userId: string) {
    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(PostItem)
      .values({ ...post, userId })
      .execute();
  }

  async updatePost(post: Partial<CreatePostRequest>, postId: string) {
    await this.postRepository
      .createQueryBuilder('post')
      .update(PostItem)
      .set(post)
      .where('post.id = :postId', { postId })
      .execute();
  }

  async publishNewPost(post: PublishPostRequest, userId: string) {
    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(PostItem)
      .values({ ...post, userId, status: PostStatus.PUBLISHED })
      .execute();
  }

  async publishDraftedPost(post: PublishPostRequest, postId: string) {
    const draftedPost = await this.postRepository.findOneOrFail(postId);
    if (!draftedPost) throw new BadRequestException('Post not found');
    await this.postRepository
      .createQueryBuilder('post')
      .update(PostItem)
      .set({ ...post, status: PostStatus.PUBLISHED })
      .where('post.id = :postId', { postId })
      .execute();
  }

  async unpublishPost(postId: string) {
    const draftedPost = await this.postRepository.findOneOrFail(postId);
    if (!draftedPost || draftedPost.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Post not found');
    }
    await this.postRepository
      .createQueryBuilder('post')
      .update(PostItem)
      .set({ status: PostStatus.UNPUBLISHED })
      .where('post.id = :postId', { postId })
      .execute();
  }
}
