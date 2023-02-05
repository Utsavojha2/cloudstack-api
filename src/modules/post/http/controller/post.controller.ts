import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UUIDParam } from 'src/core/decorator/uuid-param.decorator';
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
  async save(
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
}
