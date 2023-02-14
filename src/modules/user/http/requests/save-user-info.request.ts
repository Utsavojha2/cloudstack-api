import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';

class EmploymentHistory {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ValidateIf((job) => !job.isCurrentlyWorkingHere)
  @IsDate()
  @IsNotEmpty()
  @IsOptional()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isCurrentlyWorkingHere: boolean;
}

export class SaveUserSettings {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsOptional()
  fullName: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address format!' })
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  role: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @IsOptional()
  bio: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  employmentHistory: ReadonlyArray<EmploymentHistory>;
}
