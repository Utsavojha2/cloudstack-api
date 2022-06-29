import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { User } from 'src/models/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  handleRequest(
    err: unknown,
    user: User,
    info: any,
    context: ExecutionContext,
    status: any,
  ) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid Token!');
    }

    return super.handleRequest(err, user, info, context, status);
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
      const { user }: Request = context.switchToHttp().getRequest();
      return !!user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
