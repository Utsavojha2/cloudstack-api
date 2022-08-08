import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateUserDto } from 'src/modules/auth/dtos/validation/register-user.dto';

interface IUserPayload extends CreateUserDto {
  id: string;
  confirmAccountToken: string;
  confirmAccountTokenExpiredAt: Date;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findOneUser(query: Partial<User>) {
    return this.userRepository.findOneOrFail(query);
  }

  async saveUser(userBody: IUserPayload) {
    // const { confirm_password, ...registeredUser } = userBody;
    const newUser = this.userRepository.create(userBody);
    return await this.userRepository.save(newUser);
  }

  updateUser(userBody: Partial<User>) {
    return this.userRepository.update(userBody.id, userBody);
  }
}
