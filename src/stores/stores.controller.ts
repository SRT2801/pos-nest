import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../auth/enums/role.enum.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.storesService.create(createStoreDto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.storesService.findAll();
  }

  @Get('mine')
  findMyStores(@CurrentUser('id') userId: string) {
    return this.storesService.findStoresForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id);
  }

  @Get(':id/members')
  @Roles(Role.OWNER)
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.getStoreMembers(id);
  }

  @Patch(':storeId/members/:userId/permissions')
  @Roles(Role.OWNER)
  updateMemberPermissions(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberPermissionsDto,
  ) {
    return this.storesService.updateMemberPermissions(
      userId,
      storeId,
      dto.permissions,
    );
  }
}
