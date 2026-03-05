import { Role } from '../enums/role.enum';

export class AuthUser {
  id: string;
  email: string;
  role: Role;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}
