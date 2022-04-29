import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcryptjs';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service'
import { LoginUserDto } from './dtos/validation/login-user.dto';
import { CreateUserDto } from './dtos/validation/register-user.dto';
import { refreshCookieOptions } from './utils';
import { MoreThanOrEqual } from 'typeorm';
import { JwtAuthGuard } from './strategy/jwt.guard';

@Controller()
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly tokenService: TokenService
    ){}

    @HttpCode(HttpStatus.CREATED)
    @Post('/register-user')
    async register(@Body() registerPayload: CreateUserDto) {
        const user = await this.userService.findOneUser({ email: registerPayload.email });
        if(!!user){
            throw new BadRequestException('An email associated with account already exists!');
        }
        const salt = await genSalt(10)
        await this.userService.saveUser({
            ...registerPayload,
            password: await hash(registerPayload.password, salt),
        });
    }

    @HttpCode(HttpStatus.OK)
    @Post('/login')
    async loginUser(@Body() signInPayload: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        const requestedUser = await this.userService.findOneUser({ email: signInPayload.email });
        const isPasswordCorrect = !!requestedUser && await compare(signInPayload.password, requestedUser.password);
        if (!requestedUser || !isPasswordCorrect) {
          throw new BadRequestException('Invalid credentials');
        }
        const accessToken = await this.jwtService.signAsync({ id: requestedUser.id} , { expiresIn: '30s'});
        const refreshToken = await this.jwtService.signAsync({ id: requestedUser.id }, { secret: process.env.REFRESH_SECRET_KEY });

        await this.tokenService.saveToken({
            userId: requestedUser.id,
            token: refreshToken,
            expired_at: new Date(new Date().setDate(new Date().getDate() + 7))
        });
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);
        return { accessToken, is_verified: requestedUser.is_verified };
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('/user/me')
    async authenticateUser(@Req() req: Request) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('/refresh-token')
    async renewToken(@Req() req: Request, @Res() res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const { id } = await this.jwtService.verifyAsync(
                refreshToken, { secret: process.env.REFRESH_SECRET_KEY }
            );
            const authorizedToken = await this.tokenService.findOne({ 
                userId: id, 
                token: refreshToken,
                expired_at: MoreThanOrEqual(new Date()) as unknown as Date
            });
            if(!authorizedToken){
                throw new ForbiddenException();
            }
            const accessToken = await this.jwtService.signAsync({ id }, { expiresIn: '30s'});
            const token = await this.jwtService.signAsync({ id }, { secret: process.env.REFRESH_SECRET_KEY });
            await this.tokenService.updateToken({ userId: id }, { token });
            res
            .cookie('refreshToken', token, refreshCookieOptions)
            .send({
                accessToken
            })
        } catch(err) {
            throw new ForbiddenException()
        }
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/logout')
    async logoutUser(@Req() req: Request, @Res() res: Response) {
        const token = req.cookies.refreshToken;
        await this.tokenService.removeToken({ token });
        res.clearCookie('refreshToken').send({
            status: 'Success'
        })
    }
}
