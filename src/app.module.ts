import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MappingModule } from './mapping/mapping.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, MappingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
