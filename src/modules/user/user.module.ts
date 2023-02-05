import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follower } from 'src/models/followers.entity';
import { User } from 'src/models/user.entity';
import { FollowerController } from './http/controllers/follower.controller';
import { UserController } from './http/controllers/user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follower])],
  controllers: [UserController, FollowerController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
