import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;

        this.logger.debug(
          `${request.method} ${request.url} completed in ${duration}ms`
        );

        return {
          statusCode: 200,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data,
        };
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.logger.error(
          `${request.method} ${request.url} failed after ${duration}ms`,
          error
        );

        throw error;
      })
    );
  }
}
