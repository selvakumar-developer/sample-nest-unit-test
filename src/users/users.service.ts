import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUserResponseDto } from './dto/get-all-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserDataStrategy } from './strategy/interfaces/users.strategy';
import { USERS } from './users.decorators';

@Injectable()
export class UserService {
  constructor(@USERS() private users: UserDataStrategy) {}

  // CREATE - Add a new user
  create(createUserDto: CreateUserDto): User {
    return this.users.create(createUserDto);
  }

  // READ - Get all users
  async findAll(): Promise<GetAllUserResponseDto> {
    return this.users.findAll();
  }

  // READ - Get user by ID
  findOne(id: number): User {
    return this.users.findOne(id);
  }

  // UPDATE - Update user by ID
  update(id: number, updateUserDto: UpdateUserDto): User {
    return this.users.update(id, updateUserDto);
  }

  // DELETE - Remove user by ID
  remove(id: number): { message: string } {
    return this.users.remove(id);
  }

  count(): number {
    return this.users.count();
  }

  clear(): void {
    this.users.clear();
  }
}
