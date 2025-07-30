import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './users.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    // Clear users after each test to ensure clean state
    service.clear();
  });

  describe('create', () => {
    it('should create a user successfully', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.age).toBe(createUserDto.age);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-increment user IDs', () => {
      const createUserDto1: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createUserDto2: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      const user1 = service.create(createUserDto1);
      const user2 = service.create(createUserDto2);

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });

    it('should throw ConflictException when email already exists', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      service.create(createUserDto);

      expect(() => service.create(createUserDto)).toThrow(ConflictException);
      expect(() => service.create(createUserDto)).toThrow(
        'Email already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all users', () => {
      const createUserDto1: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createUserDto2: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      service.create(createUserDto1);
      service.create(createUserDto2);

      const result = service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Doe');
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createdUser = service.create(createUserDto);
      const result = service.findOne(1);

      expect(result).toEqual(createdUser);
    });

    it('should throw NotFoundException when user does not exist', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
      expect(() => service.findOne(999)).toThrow('User with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update a user successfully', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createdUser = service.create(createUserDto);
      const updateUserDto: UpdateUserDto = {
        name: 'John Smith',
        age: 31,
      };

      const result = service.update(1, updateUserDto);

      expect(result.id).toBe(createdUser.id);
      expect(result.name).toBe('John Smith');
      expect(result.email).toBe('john@example.com'); // unchanged
      expect(result.age).toBe(31);
    });

    it('should throw NotFoundException when user does not exist', () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Smith',
      };

      expect(() => service.update(999, updateUserDto)).toThrow(
        NotFoundException,
      );
      expect(() => service.update(999, updateUserDto)).toThrow(
        'User with ID 999 not found',
      );
    });

    it('should throw ConflictException when updating to existing email', () => {
      const createUserDto1: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createUserDto2: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      service.create(createUserDto1);
      service.create(createUserDto2);

      const updateUserDto: UpdateUserDto = {
        email: 'jane@example.com', // This email already exists
      };

      expect(() => service.update(1, updateUserDto)).toThrow(ConflictException);
      expect(() => service.update(1, updateUserDto)).toThrow(
        'Email already exists',
      );
    });

    it('should allow updating to same email', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      service.create(createUserDto);

      const updateUserDto: UpdateUserDto = {
        email: 'john@example.com', // Same email
        name: 'John Smith',
      };

      const result = service.update(1, updateUserDto);
      expect(result.email).toBe('john@example.com');
      expect(result.name).toBe('John Smith');
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      service.create(createUserDto);
      const result = service.remove(1);

      expect(result).toEqual({ message: 'User with ID 1 has been deleted' });
      expect(service.findAll()).toHaveLength(0);
    });

    it('should throw NotFoundException when user does not exist', () => {
      expect(() => service.remove(999)).toThrow(NotFoundException);
      expect(() => service.remove(999)).toThrow('User with ID 999 not found');
    });
  });

  describe('count', () => {
    it('should return 0 when no users exist', () => {
      expect(service.count()).toBe(0);
    });

    it('should return correct count of users', () => {
      const createUserDto1: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createUserDto2: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
      };

      service.create(createUserDto1);
      expect(service.count()).toBe(1);

      service.create(createUserDto2);
      expect(service.count()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all users and reset ID counter', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      service.create(createUserDto);
      expect(service.count()).toBe(1);

      service.clear();
      expect(service.count()).toBe(0);

      // Test that ID counter is reset
      const newUser = service.create(createUserDto);
      expect(newUser.id).toBe(1);
    });
  });
});
