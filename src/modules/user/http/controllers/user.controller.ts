import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/strategy/jwt.guard';
import { UserService } from '../../user.service';
@UseGuards(JwtAuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/users/:id')
  async getUser(@Query('id') id: string) {
    return await this.userService.findOneUser({ id });
  }

  @Post('/users/:id')
  async saveUserInfo() {}
}
