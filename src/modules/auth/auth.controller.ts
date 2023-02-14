import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service';
import { LoginUserDto } from './dtos/validation/login-user.dto';
import { CreateUserDto } from './dtos/validation/register-user.dto';
import { refreshCookieOptions } from './utils';
import { MoreThanOrEqual } from 'typeorm';
import { JwtAuthGuard } from './strategy/jwt.guard';
import { User } from 'src/models/user.entity';

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register-user')
  async register(@Body() registerPayload: CreateUserDto) {
    const user = await this.userService.findOneUser({
      email: registerPayload.email,
    });
    if (!!user) {
      throw new BadRequestException(
        'An email associated with account already exists!',
      );
    }
    const salt = await genSalt(10);
    const userId = uuid();
    const { confirmAccountToken, ...savedUser } =
      await this.userService.saveUser({
        ...registerPayload,
        id: userId,
        password: await hash(registerPayload.password, salt),
        confirmAccountToken: await this.jwtService.signAsync(
          { id: userId },
          {
            expiresIn: '2d',
            secret: process.env.CONFIRM_ACCOUNT_SECRET_KEY,
          },
        ),
        confirmAccountTokenExpiredAt: new Date(
          new Date().setDate(new Date().getDate() + 2),
        ),
      });
    await this.mailService.sendEmailMessage({
      email: registerPayload.email,
      subject: 'Account Confirmation Email',
      templateName: 'src/modules/mail/templates/confirm-account.hbs',
      context: {
        name: savedUser.fullName,
        confirmAccountUrl: `${process.env.FRONTEND_URL}/auth/confirm-account/${confirmAccountToken}`,
      },
    });
    return savedUser;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async loginUser(
    @Body() signInPayload: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const requestedUser = await this.userService.findOneUser({
      email: signInPayload.email,
    });
    const isPasswordCorrect =
      !!requestedUser &&
      (await compare(signInPayload.password, requestedUser.password));
    if (!requestedUser || !isPasswordCorrect) {
      throw new BadRequestException('Invalid credentials');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id: requestedUser.id }, { expiresIn: '1w' }),
      this.jwtService.signAsync(
        { id: requestedUser.id },
        { secret: process.env.REFRESH_SECRET_KEY },
      ),
    ]);

    await this.tokenService.saveToken({
      userId: requestedUser.id,
      token: refreshToken,
      expired_at: new Date(new Date().setDate(new Date().getDate() + 7)),
    });
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return { accessToken, is_verified: requestedUser.is_verified };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:userId/send-account-confirmation')
  async resendAccountConfirmationEmail(@Req() req: Request) {
    const user = req.user as User;
    const currentDateTime = new Date();
    const confirmAccountTokenUpdatedDate = new Date(
      user.confirmAccountTokenUpdatedAt,
    );
    if (
      currentDateTime.getDate() - confirmAccountTokenUpdatedDate.getDate() <
      2
    ) {
      throw new BadRequestException(
        'Must wait two days before sending another confirmation email',
      );
    }
    const newConfirmAccountToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        expiresIn: '2d',
        secret: process.env.CONFIRM_ACCOUNT_SECRET_KEY,
      },
    );
    const confirmAccountTokenUpdatedAt = new Date();
    await Promise.all([
      this.userService.updateUser({
        id: user.id,
        confirmAccountToken: newConfirmAccountToken,
        confirmAccountTokenExpiredAt: new Date(
          new Date().setDate(new Date().getDate() + 2),
        ),
        confirmAccountTokenUpdatedAt,
      }),
      this.mailService.sendEmailMessage({
        email: user.email,
        subject: 'Account Confirmation Email',
        templateName: 'src/modules/mail/templates/confirm-account.hbs',
        context: {
          name: user.fullName,
          confirmAccountUrl: `${process.env.FRONTEND_URL}/auth/confirm-account/${newConfirmAccountToken}`,
        },
      }),
    ]);
    return { confirmAccountTokenUpdatedAt };
  }

  @Get('/account-confirmation/:token')
  async confirmUserAccount(
    @Param('token') confirmAccountToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { id: userId } = await this.jwtService.verifyAsync(
        confirmAccountToken,
        { secret: process.env.CONFIRM_ACCOUNT_SECRET_KEY },
      );
      const user = await this.userService.findOneUser({
        id: userId,
        confirmAccountToken,
        confirmAccountTokenExpiredAt: MoreThanOrEqual(
          new Date(),
        ) as unknown as Date,
      });
      if (!user.id) throw new ForbiddenException();
      if (user.is_verified) {
        throw new BadRequestException({
          statusCode: HttpStatus.METHOD_NOT_ALLOWED,
          message: 'Account already confirmed',
        });
      }
      const accessToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '30s' },
      );
      const refreshToken = await this.jwtService.signAsync(
        { id: user.id },
        { secret: process.env.REFRESH_SECRET_KEY },
      );
      await this.userService.updateUser({ id: user.id, is_verified: true });
      res.cookie('refreshToken', refreshToken, refreshCookieOptions);
      return { accessToken };
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/me')
  async authenticateUser(@Req() req: Request) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/refresh-token')
  async renewToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_SECRET_KEY,
      });
      const authorizedToken = await this.tokenService.findOne({
        userId: id,
        token: refreshToken,
        expired_at: MoreThanOrEqual(new Date()) as unknown as Date,
      });
      if (!authorizedToken) {
        throw new ForbiddenException();
      }
      const accessToken = await this.jwtService.signAsync(
        { id },
        { expiresIn: '30s' },
      );
      const token = await this.jwtService.signAsync(
        { id },
        { secret: process.env.REFRESH_SECRET_KEY },
      );
      await this.tokenService.updateToken({ userId: id }, { token });
      res.cookie('refreshToken', token, refreshCookieOptions).send({
        accessToken,
      });
    } catch (err) {
      throw new ForbiddenException();
    }
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/logout')
  async logoutUser(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies.refreshToken;
    await this.tokenService.removeToken({ token });
    res.clearCookie('refreshToken').send({
      status: 'Success',
    });
  }
}
