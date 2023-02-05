import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import { PostItem, PostStatus, PostVersion } from 'src/models/post.entity';
import { bufferToStream } from '../storage/storage.provider';
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
    const id = uuidv4();
    const posts = { ...post, id, userId, postId: id };
    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(PostItem)
      .values([
        {
          ...(post.status === PostStatus.PUBLISHED && {
            ...posts,
            version: PostVersion.PUBLISHED,
          }),
        },
        {
          ...posts,
          id: uuidv4(),
          version: PostVersion.LATEST,
        },
      ])
      .execute();
  }

  async updatePost(post: Partial<CreatePostRequest>, postId: string) {
    const postRepository = this.postRepository.createQueryBuilder('post');
    const postItem = await this.postRepository.findOne({
      id: postId,
      status: PostStatus.PUBLISHED,
    });

    const queryRunner = await getConnection().createQueryRunner();
    if (!postItem && post.status === PostStatus.UNPUBLISHED) {
      throw new UnprocessableEntityException(
        'Unable to unpublish post. Needs to be published first.',
      );
    }

    if (!!postItem && post.status === PostStatus.PUBLISHED) {
      await queryRunner.startTransaction();
      try {
        await Promise.all([
          postRepository
            .update(PostItem)
            .set({
              ...post,
              version: PostVersion.PUBLISHED,
            })
            .where('post.id = :id', { id: postId })
            .execute(),
          postRepository
            .update(PostItem)
            .set({
              ...post,
              version: PostVersion.LATEST,
            })
            .where('post.postId = :id AND post.id != :id', { id: postId })
            .execute(),
        ]);
        return await queryRunner.commitTransaction();
      } catch (err) {
        return await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }

    if (!!postItem && post.status === PostStatus.DRAFT) {
      return await postRepository
        .update(PostItem)
        .set({
          ...post,
          version: PostVersion.LATEST,
        })
        .where(
          'post.postId = :id AND post.id != :id AND post.version = :version',
          { id: postId, version: PostVersion.LATEST },
        )
        .execute();
    }

    if (!!postItem && post.status === PostStatus.UNPUBLISHED) {
      await queryRunner.startTransaction();
      try {
        await postRepository
          .delete()
          .from(PostItem)
          .where(
            `post.id = :id AND post.status = :status AND post.version = :version`,
            {
              id: postId,
              status: PostStatus.PUBLISHED,
              version: PostVersion.PUBLISHED,
            },
          )
          .execute();

        await postRepository
          .update(PostItem)
          .set({
            ...post,
            version: PostVersion.LATEST,
          })
          .where('post.postId = :id AND post.id != :id', { id: postId })
          .execute();
        return await queryRunner.commitTransaction();
      } catch (err) {
        return await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }

    await postRepository
      .update(PostItem)
      .set({
        ...post,
        version: PostVersion.LATEST,
      })
      .where('post.id = :id', { id: postId })
      .execute();
  }
}
