import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  organizationId?: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract tenant from JWT token (added during authentication)
    if (request.user && request.user.tenantId) {
      request.tenantId = request.user.tenantId;
    }

    // Also check header for tenant override (for admin operations)
    const tenantHeader = request.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      request.tenantId = tenantHeader;
    }

    // For protected routes, ensure tenant is set
    if (!request.tenantId && this.isProtectedRoute(request.path)) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    return next.handle();
  }

  private isProtectedRoute(path: string): boolean {
    // Routes that don't require tenant
    const publicRoutes = [
      '/health',
      '/api/v1/auth/register',
      '/api/v1/auth/login',
      '/api/v1/auth/forgot-password',
      '/graphql',
    ];

    return !publicRoutes.some((route) => path.startsWith(route));
  }
}
