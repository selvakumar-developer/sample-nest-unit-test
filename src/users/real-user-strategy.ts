import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MappingService } from 'src/mapping/mapping.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUserResponseDto } from './dto/get-all-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserDataStrategy } from './interfaces/users.interface';
import { UsersApi } from './users.api';

@Injectable()
export class RealUserDataStrategy implements UserDataStrategy {
  private users: User[] = [];
  private nextId = 1;

  constructor(
    private readonly mappingService: MappingService,
    private readonly usersApi: UsersApi,
  ) {}

  // CREATE - Add a new user
  create(createUserDto: CreateUserDto): User {
    // Check if email already exists
    const existingUser = this.users.find(
      (user) => user.email === createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new User({
      id: this.nextId++,
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.push(newUser);
    return newUser;
  }

  // READ - Get all users
  async findAll(): Promise<GetAllUserResponseDto> {
    const usersList = await this.usersApi.findAll();
    const convertedResponse = this.mappingService.mapToDTOSync(
      GetAllUserResponseDto,
      usersList,
    );

    return convertedResponse;
  }

  // READ - Get user by ID
  findOne(id: number): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // UPDATE - Update user by ID
  update(id: number, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email already exists (excluding current user)
    if (updateUserDto.email) {
      const existingUser = this.users.find(
        (user) => user.email === updateUserDto.email && user.id !== id,
      );
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  // DELETE - Remove user by ID
  remove(id: number): { message: string } {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
    return { message: `User with ID ${id} has been deleted` };
  }

  count(): number {
    return this.users.length;
  }

  clear(): void {
    this.users = [];
    this.nextId = 1;
  }
}
