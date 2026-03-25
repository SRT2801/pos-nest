import { Module } from '@nestjs/common';
import { SupabaseAuthProvider } from './supabase.provider.js';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { StoresModule } from '../stores/stores.module.js';

@Module({
  imports: [StoresModule],
  controllers: [AuthController],
  providers: [
    SupabaseAuthProvider,
    SupabaseAuthGuard,
    RolesGuard,
    PermissionsGuard,
    AuthService,
  ],
  exports: [
    SupabaseAuthProvider,
    SupabaseAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
