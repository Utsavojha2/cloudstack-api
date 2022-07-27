import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UUIDParam } from 'src/decorator/uuid-param.decorator';
import { JwtAuthGuard } from 'src/modules/auth/strategy/jwt.guard';
import { multerOptions } from '../../../storage/multer.config';
import { PostService } from '../../post.service';
import { SharpPipe } from '../../sharp.pipe';
import { CreatePostRequest } from '../request/create-post.request';
import { PublishPostRequest } from '../request/publish-post.request';

// @UseGuards(JwtAuthGuard)
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 3, multerOptions))
  async uploadImage(
    @UploadedFiles(SharpPipe)
    uploadedImages: ReadonlyArray<Array<Record<string, Buffer>>>,
  ) {
    if (!uploadedImages.length) {
      throw new BadRequestException('Image is required');
    }
    return await Promise.all(
      uploadedImages.map(async (images) => {
        const imageIds = await Promise.all(
          images.map(async (image) => {
            const [filename] = Object.keys(image);
            await this.postService.uploadImage(image[filename], {
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

  @Post('/:userId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: PublishPostRequest,
  ) {
    await this.postService.savePost(postInfo, userId);
  }

  @Patch('/:userId/posts/:postId')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatePost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: CreatePostRequest,
  ) {
    console.log(postInfo);
  }

  @Post('/:userId/posts/publish')
  @HttpCode(HttpStatus.ACCEPTED)
  async publishPost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: CreatePostRequest,
  ) {
    console.log(postInfo);
  }

  @Post('/:userId/posts/unpublish')
  @HttpCode(HttpStatus.ACCEPTED)
  async unpublishPost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: CreatePostRequest,
  ) {
    console.log(postInfo);
  }
}
