import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { Role } from '../enums/role.enum.js';
import { AuthUser } from '../interfaces/auth-user.interface.js';
import { StoreContextService } from '../../common/cls/store-context.service.js';
import { StoresService } from '../../stores/stores.service.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject('SUPABASE_AUTH') private readonly supabase: SupabaseClient,
    private readonly reflector: Reflector,
    private readonly storeContext: StoreContextService,
    private readonly storesService: StoresService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (isPublic && !token) {
      const headerStoreId = request.headers['x-store-id'];
      if (headerStoreId) {
        this.storeContext.setStoreId(headerStoreId);
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const globalRole = (user.app_metadata?.role as Role) ?? Role.CUSTOMER;

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        role: globalRole,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      };

      const headerStoreId = request.headers['x-store-id'] as string | undefined;

      if (globalRole === Role.SUPER_ADMIN) {
        authUser.role = Role.SUPER_ADMIN;
        if (headerStoreId) {
          authUser.storeId = headerStoreId;
          this.storeContext.setStoreId(headerStoreId);
        }
      } else if (headerStoreId) {
        const storeUser = await this.storesService.getUserStoreRole(
          user.id,
          headerStoreId,
        );
        if (storeUser) {
          authUser.storeId = headerStoreId;
          authUser.role = storeUser.role;
          authUser.permissions = storeUser.permissions ?? [];
          this.storeContext.setStoreId(headerStoreId);
        } else {
          authUser.storeId = headerStoreId;
          authUser.role = Role.CUSTOMER;
          authUser.permissions = [];
          this.storeContext.setStoreId(headerStoreId);
        }
      } else {
        const userStores = await this.storesService.findStoresForUser(user.id);
        if (userStores.length > 0) {
          const defaultStoreUser = userStores[0];
          authUser.storeId = defaultStoreUser.storeId;
          authUser.role = defaultStoreUser.role;
          authUser.permissions = defaultStoreUser.permissions ?? [];
          this.storeContext.setStoreId(defaultStoreUser.storeId);
        }
      }

      this.storeContext.setUserId(user.id);
      this.storeContext.setRole(authUser.role);

      request.user = authUser;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | undefined {
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
