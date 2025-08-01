import { Global, Module } from '@nestjs/common';
import { MappingService } from './mapping.service';

@Global() // Makes this module global
@Module({
  providers: [MappingService],
  exports: [MappingService],
})
export class MappingModule {}
