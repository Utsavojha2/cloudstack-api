import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './register-user.dto';

export class LoginUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}
