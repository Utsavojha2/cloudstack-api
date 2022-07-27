import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { PostVisibility } from 'src/models/post.entity';

export class CreatePostRequest {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  readonly content: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('4', { each: true })
  readonly photos?: ReadonlyArray<string>;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(PostVisibility)
  readonly visibility?: PostVisibility;
}
