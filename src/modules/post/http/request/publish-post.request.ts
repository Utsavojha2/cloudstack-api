import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { PostVisibility } from 'src/models/post.entity';

export class PublishPostRequest {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  readonly content: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('4', { each: true })
  readonly photos: ReadonlyArray<string>;

  @IsNotEmpty()
  @IsString()
  @IsEnum(PostVisibility)
  readonly visibility: PostVisibility;
}
