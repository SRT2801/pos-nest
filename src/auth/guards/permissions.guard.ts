import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { Role } from '../enums/role.enum.js';
import {
  ADMIN_DEFAULT_PERMISSIONS,
  Permission,
} from '../enums/permission.enum.js';
import { AuthUser } from '../interfaces/auth-user.interface.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;

    if (isPublic && !user) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === Role.SUPER_ADMIN || user.role === Role.OWNER) {
      return true;
    }

    if (user.role === Role.ADMIN) {
      const hasPermission = requiredPermissions.every((p) =>
        ADMIN_DEFAULT_PERMISSIONS.includes(p),
      );
      if (hasPermission) return true;
    }

    const userPermissions = user.permissions ?? [];
    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
