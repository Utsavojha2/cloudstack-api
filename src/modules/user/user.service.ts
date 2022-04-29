import { Global, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/models/user.entity'
import { instanceToPlain } from 'class-transformer';
import { CreateUserDto } from 'src/modules/auth/dtos/validation/register-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    findAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    findOneUser(query: Partial<User>) {
        return this.userRepository.findOne(query);
    }

    async saveUser(userBody: CreateUserDto) {
        const { confirm_password , ...registeredUser} = userBody;
        const newUser = this.userRepository.create({
            ...registeredUser,
            is_verified: false,
        });
        return await this.userRepository.save(newUser);
    }
}
