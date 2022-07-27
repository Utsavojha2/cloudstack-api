import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
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
    return await this.postService.uploadPipedImages(uploadedImages);
  }

  @Post('/:userId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: CreatePostRequest,
  ) {
    await this.postService.savePost(postInfo, userId);
  }

  @Patch('/posts/:postId')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatePost(
    @UUIDParam('postId') postId: string,
    @Body() postInfo: Partial<CreatePostRequest>,
  ) {
    await this.postService.updatePost(postInfo, postId);
  }

  @Post('/:userId/posts/publish')
  @HttpCode(HttpStatus.ACCEPTED)
  async publishNewPost(
    @UUIDParam('userId') userId: string,
    @Body() postInfo: PublishPostRequest,
  ) {
    await this.postService.publishNewPost(postInfo, userId);
  }

  @Post('/posts/:postId/publish')
  @HttpCode(HttpStatus.ACCEPTED)
  async publishStalePost(
    @UUIDParam('postId') postId: string,
    @Body() postInfo: PublishPostRequest,
  ) {
    await this.postService.publishDraftedPost(postInfo, postId);
  }

  @Post('/posts/:postId/unpublish')
  @HttpCode(HttpStatus.ACCEPTED)
  async unpublishPost(@UUIDParam('postId') postId: string) {
    await this.postService.unpublishPost(postId);
  }
}
