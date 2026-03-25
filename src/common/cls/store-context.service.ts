import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CLS_ROLE_KEY, CLS_STORE_KEY, CLS_USER_KEY } from './cls.config.js';
import { Role } from '../../auth/enums/role.enum.js';

@Injectable()
export class StoreContextService {
  constructor(private readonly cls: ClsService) {}

  setStoreId(storeId: string) {
    this.cls.set(CLS_STORE_KEY, storeId);
  }

  getStoreId(): string | undefined {
    return this.cls.get(CLS_STORE_KEY);
  }

  setUserId(userId: string) {
    this.cls.set(CLS_USER_KEY, userId);
  }

  getUserId(): string | undefined {
    return this.cls.get(CLS_USER_KEY);
  }

  setRole(role: Role) {
    this.cls.set(CLS_ROLE_KEY, role);
  }

  getRole(): Role | undefined {
    return this.cls.get(CLS_ROLE_KEY);
  }
}
