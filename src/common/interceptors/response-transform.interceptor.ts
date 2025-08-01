import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RESPONSE_MESSAGE_KEY,
  RESPONSE_TRANSFORM_KEY,
} from '../decorators/api-response.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if transformation should be skipped
    const skipTransform = this.reflector.get<boolean>(
      RESPONSE_TRANSFORM_KEY,
      context.getHandler(),
    );

    if (skipTransform === false) {
      return next.handle();
    }

    // Get custom message from decorator
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Handle different response types
        let transformedData = data;
        let message = customMessage || this.getDefaultMessage(request.method);
        let meta;

        // Check if data is already in ApiResponse format
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle paginated responses
        if (data && typeof data === 'object' && 'items' in data) {
          transformedData = data.items;
          meta = {
            total: data.total || data.items?.length || 0,
            page: data.page || 1,
            limit: data.limit || 10,
            hasNext: data.hasNext || false,
            hasPrevious: data.hasPrevious || false,
          };
          message =
            customMessage || `Retrieved ${data.items?.length || 0} items`;
        }

        // Handle array responses
        else if (Array.isArray(data)) {
          message = customMessage || `Retrieved ${data.length} items`;
        }

        // Handle single object responses
        else if (data && typeof data === 'object') {
          if (!customMessage) {
            if (request.method === 'POST') {
              message = 'Resource created successfully';
            } else if (request.method === 'PUT' || request.method === 'PATCH') {
              message = 'Resource updated successfully';
            } else {
              message = 'Resource retrieved successfully';
            }
          }
        }

        // Handle boolean responses (for delete operations)
        else if (typeof data === 'boolean') {
          transformedData = null;
          message = customMessage || 'Operation completed successfully';
        }

        // Handle null/undefined responses
        else if (data === null || data === undefined) {
          transformedData = null;
          message = customMessage || 'No data found';
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: transformedData,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(meta && { meta }),
        };
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    switch (method) {
      case 'POST':
        return 'Resource created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      case 'GET':
      default:
        return 'Success';
    }
  }
}
