import { ForbiddenException } from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { StoreContextService } from '../cls/store-context.service.js';
import { Role } from '../../auth/enums/role.enum.js';

/**
 * Base service that automatically scopes all queries to the current store.
 * Extend this in any service that manages store-owned entities.
 */
export abstract class StoreScopedService<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly storeContext: StoreContextService,
  ) {}

  protected getRequiredStoreId(): string {
    const storeId = this.storeContext.getStoreId();
    if (!storeId) {
      throw new ForbiddenException('Store context is required');
    }
    return storeId;
  }

  protected isSuperAdmin(): boolean {
    return this.storeContext.getRole() === Role.SUPER_ADMIN;
  }

  /**
   * Adds storeId filter to a where clause.
   * Super admins bypass store scoping.
   */
  protected scopeWhere(
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    if (this.isSuperAdmin()) {
      return where ?? ({} as FindOptionsWhere<T>);
    }

    const storeId = this.getRequiredStoreId();

    if (Array.isArray(where)) {
      return where.map((w) => ({ ...w, storeId }) as FindOptionsWhere<T>);
    }

    return { ...where, storeId } as unknown as FindOptionsWhere<T>;
  }

  protected scopedFind(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
      where: this.scopeWhere(options?.where as FindOptionsWhere<T>),
    });
  }

  protected scopedFindAndCount(
    options?: FindManyOptions<T>,
  ): Promise<[T[], number]> {
    return this.repository.findAndCount({
      ...options,
      where: this.scopeWhere(options?.where as FindOptionsWhere<T>),
    });
  }

  protected scopedFindOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      ...options,
      where: this.scopeWhere(options.where as FindOptionsWhere<T>),
    });
  }

  /**
   * Saves an entity, automatically attaching the current storeId.
   */
  protected scopedSave(entity: Partial<T>): Promise<T> {
    if (!this.isSuperAdmin()) {
      const storeId = this.getRequiredStoreId();
      (entity as any).storeId = storeId;
    }
    return this.repository.save(entity as any);
  }
}
