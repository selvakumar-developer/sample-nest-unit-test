import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

interface MapperOptions {
  validateResult?: boolean;
  excludeExtraneousValues?: boolean;
}

@Injectable()
export class MappingService {
  // Fixed async mapper with proper array validation
  async mapToDTO<T extends object>(
    dtoClass: ClassConstructor<T>,
    data: any,
    options: MapperOptions = {},
  ): Promise<T> {
    const { validateResult = false, excludeExtraneousValues = true } = options;

    // Transform keys if requested
    let processedData = data;

    // Transform plain object to class instance
    const instance = plainToInstance(dtoClass, processedData, {
      excludeExtraneousValues,
      enableImplicitConversion: true,
    });

    // Validate if requested
    if (validateResult) {
      await this.validateInstance(instance);
    }

    return instance;
  }

  // Fixed sync mapper - no validation since it's sync
  mapToDTOSync<T extends object>(
    dtoClass: ClassConstructor<T>,
    data: any,
    options: MapperOptions = {},
  ): T {
    const { excludeExtraneousValues = true, validateResult = false } = options;

    // Ignore validation in sync mode or throw error
    if (validateResult) {
      throw new Error(
        'Validation is not supported in sync mode. Use mapToDTO() for validation.',
      );
    }

    let processedData = data;

    // Transform plain object to class instance
    return plainToInstance(dtoClass, processedData, {
      excludeExtraneousValues,
      enableImplicitConversion: true,
    });
  }

  // Helper method to validate instances (handles arrays)
  private async validateInstance(instance: any): Promise<void> {
    if (Array.isArray(instance)) {
      // Validate each item in the array
      for (let i = 0; i < instance.length; i++) {
        try {
          await validateOrReject(instance[i]);
        } catch (errors) {
          throw new HttpException(
            `Validation failed at index ${i}: ${this.formatValidationErrors(errors)}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      // Validate single object
      try {
        await validateOrReject(instance);
      } catch (errors) {
        throw new Error(
          `Validation failed: ${this.formatValidationErrors(errors)}`,
        );
      }
    }
  }

  // Helper method to format validation errors
  private formatValidationErrors(errors: any[]): string {
    return errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
  }

  // Transform keys utility
  transformKeysToSnakeCase<T extends Record<string, any>>(obj: T): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformKeysToSnakeCase(item));
    }

    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = this.camelToSnake(key);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[snakeKey] = this.transformKeysToSnakeCase(value);
      } else {
        result[snakeKey] = value;
      }
    }

    return result;
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
