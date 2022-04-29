import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsDate, MaxDate } from "class-validator";
import { Match } from 'src/decorator/match.decorator';
import { IsOlderThan } from "src/decorator/age-limit.decorator";
import { Type } from "class-transformer";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    fullName: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email address format!' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @Match('password')
    confirm_password: string;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate({ message: 'Invalid date format!' })
    @MaxDate(new Date(), { message: 'Invalid date' })
    @IsOlderThan()
    birthDate: string;
};
