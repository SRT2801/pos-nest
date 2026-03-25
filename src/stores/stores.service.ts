import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity.js';
import { StoreUser } from './entities/store-user.entity.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { Role } from '../auth/enums/role.enum.js';
import {
  Permission,
  ADMIN_DEFAULT_PERMISSIONS,
} from '../auth/enums/permission.enum.js';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreUser)
    private readonly storeUserRepository: Repository<StoreUser>,
  ) {}

  async create(createStoreDto: CreateStoreDto, ownerId: string) {
    const existing = await this.storeRepository.findOneBy({
      slug: createStoreDto.slug,
    });
    if (existing) {
      throw new ConflictException('A store with this slug already exists');
    }

    const store = await this.storeRepository.save(createStoreDto);

    await this.storeUserRepository.save({
      userId: ownerId,
      storeId: store.id,
      role: Role.OWNER,
    });

    return store;
  }

  async findAll() {
    return this.storeRepository.find();
  }

  async findOne(id: string) {
    const store = await this.storeRepository.findOneBy({ id });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    const store = await this.findOne(id);

    if (updateStoreDto.slug && updateStoreDto.slug !== store.slug) {
      const existing = await this.storeRepository.findOneBy({
        slug: updateStoreDto.slug,
      });
      if (existing) {
        throw new ConflictException('A store with this slug already exists');
      }
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async remove(id: string) {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
    return { message: 'Store removed successfully' };
  }

  async findStoresForUser(userId: string) {
    return this.storeUserRepository.find({
      where: { userId },
      relations: { store: true },
    });
  }

  async addUserToStore(
    userId: string,
    storeId: string,
    role: Role,
    permissions?: Permission[],
  ) {
    const store = await this.findOne(storeId);

    const existing = await this.storeUserRepository.findOneBy({
      userId,
      storeId: store.id,
    });
    if (existing) {
      throw new ConflictException('User is already a member of this store');
    }

    return this.storeUserRepository.save({
      userId,
      storeId: store.id,
      role,
      permissions: permissions ?? [],
    });
  }

  async updateMemberPermissions(
    userId: string,
    storeId: string,
    permissions: Permission[],
  ) {
    const storeUser = await this.storeUserRepository.findOneBy({
      userId,
      storeId,
    });
    if (!storeUser) {
      throw new NotFoundException('Member not found in this store');
    }

    storeUser.permissions = permissions;
    return this.storeUserRepository.save(storeUser);
  }

  async getStoreMembers(storeId: string) {
    const members = await this.storeUserRepository.find({
      where: { storeId },
    });

    return members.map((member) => ({
      ...member,
      permissions:
        member.role === Role.OWNER || member.role === Role.ADMIN
          ? ADMIN_DEFAULT_PERMISSIONS
          : member.permissions,
    }));
  }

  async getUserStoreRole(
    userId: string,
    storeId: string,
  ): Promise<StoreUser | null> {
    return this.storeUserRepository.findOneBy({ userId, storeId });
  }
}
