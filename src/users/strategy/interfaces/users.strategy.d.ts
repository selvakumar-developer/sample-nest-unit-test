import { CreateUserDto } from '../../dto/create-user.dto';
import { GetAllUserResponseDto } from '../../dto/get-all-user-response.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';

export interface UserDataStrategy {
  findAll(): Promise<GetAllUserResponseDto>;
  findOne(id: number): User;
  create(userData: CreateUserDto): User;
  update(id: number, userData: UpdateUserDto): User;
  remove(id: number): { message: string };
  count(): number;
  clear(): void;
}
