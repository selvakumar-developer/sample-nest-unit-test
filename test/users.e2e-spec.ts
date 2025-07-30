import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersModule } from './../src/users/users.module';

describe('UserController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(createUserDto.name);
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.age).toBe(createUserDto.age);
        });
    });

    it('should return 409 when email already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Try to create user with same email
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      await request(app.getHttpServer()).post('/users').send(createUserDto);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user by ID', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe(createUserDto.name);
        });
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer()).get('/users/999').expect(404);
    });
  });
});
