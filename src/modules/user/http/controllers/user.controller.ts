import {
  BadGatewayException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UUIDParam } from 'src/decorator/uuid-param.decorator';
import { JwtAuthGuard } from 'src/modules/auth/strategy/jwt.guard';
import { UserService } from 'src/modules/user/user.service';
import { SaveUserSettings } from '../requests/save-user-info.request';

@UseGuards(JwtAuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/users/:id')
  async saveUserInfo(
    @UUIDParam('id') id: string,
    @Body() settings: SaveUserSettings,
  ) {
    const user = await this.userService.findOneUser({ id });
    if (!user) {
      throw new BadGatewayException('User not found');
    }
    console.log(settings);
  }
}
