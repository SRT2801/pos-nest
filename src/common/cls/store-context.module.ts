import { Global, Module } from '@nestjs/common';
import { StoreContextService } from './store-context.service.js';

@Global()
@Module({
  providers: [StoreContextService],
  exports: [StoreContextService],
})
export class StoreContextModule {}
