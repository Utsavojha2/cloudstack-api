import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import difference from 'lodash/difference';
import { User } from 'src/models/user.entity';
import { CreateUserDto } from 'src/modules/auth/dtos/validation/register-user.dto';
import { Follower } from 'src/models/followers.entity';

interface IUserPayload extends CreateUserDto {
  id: string;
  confirmAccountToken: string;
  confirmAccountTokenExpiredAt: Date;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
  ) {}

  findOneUser(query: Partial<User>) {
    return this.userRepository.findOneOrFail(query);
  }

  async saveUser(userBody: IUserPayload) {
    const newUser = this.userRepository.create(userBody);
    return await this.userRepository.save(newUser);
  }

  async updateUser(userBody: Partial<User>) {
    return await this.userRepository.update(userBody.id, userBody);
  }

  async followUser(userId: string, followerId: string) {
    const follower = await this.userRepository.findOne(followerId);
    if (!follower || followerId === userId) {
      throw new UnprocessableEntityException('Invalid operation');
    }
    const followingRecord = await this.followerRepository.findOne({
      userId,
      followerId,
    });
    if (!!followingRecord) {
      throw new UnprocessableEntityException('Already following');
    }
    const entity = this.followerRepository.create({
      userId,
      followerId,
    });
    return await this.followerRepository.save(entity);
  }

  async getUserFollowers(userId: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(Follower, 'follower', `follower."userId" = user.id`)
      .select([
        'user.id' as 'id',
        'user.fullName' as 'fullName',
        'user.email' as 'email',
        `array_remove(array_agg(follower."followerId"), NULL) as "followingIds"`,
      ])
      .where('user.is_verified IS NOT NULL AND user.id = :id', { id: userId })
      .groupBy('user.id')
      .getRawOne();
  }

  async exploreNewFollowers(userId: string) {
    const user = await this.getUserFollowers(userId);

    const concatFollowersSQL =
      'array_remove(array_agg(follower."followerId"), NULL)';

    const mutualFollowersSQL = `ARRAY(SELECT UNNEST(${concatFollowersSQL}) INTERSECT SELECT UNNEST(ARRAY[${user.followingIds
      .map((id: string) => `'${id}'`)
      .join(',')}]::uuid[]))`;

    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(Follower, 'follower', `follower."userId" = user.id`)
      .where('user.is_verified IS NOT NULL')
      .andWhere('user.id != :id', { id: userId })
      .andWhere('user.id NOT IN (:...followingIds)', {
        followingIds: user.followingIds,
      })
      .having(`:id != ALL(${concatFollowersSQL})`, {
        id: userId,
      })
      .select([
        'user.id' as 'userId',
        'user.fullName' as 'fullName',
        'user.email' as 'email',
        `${concatFollowersSQL} as "followingIds"`,
        `${mutualFollowersSQL} as mutualFollowings`,
      ])
      .groupBy('user.id')
      .orderBy(`array_length(${mutualFollowersSQL}, 1)`)
      .addOrderBy('user.created_at', 'ASC')
      .getRawMany();
  }
}
