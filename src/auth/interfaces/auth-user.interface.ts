import { Role } from '../enums/role.enum.js';
import { Permission } from '../enums/permission.enum.js';

export class AuthUser {
  id: string;
  email: string;
  role: Role;
  storeId?: string;
  permissions?: Permission[];
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}
