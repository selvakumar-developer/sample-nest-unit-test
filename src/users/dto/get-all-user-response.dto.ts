import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class GetAllUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  age: number;

  @Expose({ name: 'createdAt' })
  created_at: Date;

  @Expose({ name: 'updatedAt' })
  updated_at: Date;
}
