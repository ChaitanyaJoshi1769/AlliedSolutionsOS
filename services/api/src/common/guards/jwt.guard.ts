import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Allow public routes
    const publicRoutes = [
      '/api/v1/auth/register',
      '/api/v1/auth/login',
      '/api/v1/auth/forgot-password',
      '/health',
      '/graphql',
    ];

    if (publicRoutes.some((route) => request.path.startsWith(route))) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
