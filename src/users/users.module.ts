import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROVIDER_NAME } from 'src/lib/constants';
import { MappingService } from 'src/mapping/mapping.service';
import { MockUserDataStrategy } from './mock-user-strategy';
import { RealUserDataStrategy } from './real-user-strategy';
import { UsersApi } from './users.api';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UserService,
    MappingService, // Make sure MappingService is provided
    MockUserDataStrategy, // Register as providers
    RealUserDataStrategy, // Register as providers
    UsersApi,
    {
      provide: PROVIDER_NAME.USERS,
      useFactory: (
        configService: ConfigService,
        mockStrategy: MockUserDataStrategy,
        realStrategy: RealUserDataStrategy,
      ) => {
        const isMockEnabled = configService.get('MOCK') === 'true';
        return isMockEnabled ? mockStrategy : realStrategy;
      },
      inject: [ConfigService, MockUserDataStrategy, RealUserDataStrategy],
    },
  ],
})
export class UsersModule {}
