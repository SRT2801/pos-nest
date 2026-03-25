import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresService } from './stores.service.js';
import { StoresController } from './stores.controller.js';
import { Store } from './entities/store.entity.js';
import { StoreUser } from './entities/store-user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreUser])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
