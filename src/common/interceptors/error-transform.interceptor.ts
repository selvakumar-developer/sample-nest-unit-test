import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ErrorTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError((error) => {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let data = null;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const errorResponse = error.getResponse();

          if (typeof errorResponse === 'string') {
            message = errorResponse;
          } else if (typeof errorResponse === 'object') {
            message = (errorResponse as any).message || error.message;
            data = (errorResponse as any).data || null;
          }
        }

        const errorApiResponse: ApiResponse = {
          success: false,
          statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return throwError(
          () => new HttpException(errorApiResponse, statusCode),
        );
      }),
    );
  }
}
