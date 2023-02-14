import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UUIDParam } from 'src/core/decorator/uuid-param.decorator';
import { User } from 'src/models/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/strategy/jwt.guard';
import { UserService } from 'src/modules/user/user.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class FollowerController {
  constructor(private readonly userService: UserService) {}

  @Post('/account/follow/:followerId')
  async followAccount(
    @UUIDParam('followerId') followerId: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return await this.userService.followUser(user.id, followerId);
  }

  @Get('/account/explore')
  async exploreUsers(@Req() req: Request) {
    const user = req.user as User;
    return await this.userService.exploreNewFollowers(user?.id);
  }

  @Get('/account/:accountType')
  async isFollowing(@Req() req: Request) {
    const user = req.user as User;
    return await this.userService.exploreNewFollowers(user?.id);
  }
}
