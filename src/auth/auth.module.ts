import { Module } from '@nestjs/common';
import { SupabaseAuthProvider } from './supabase.provider';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [SupabaseAuthProvider, SupabaseAuthGuard, RolesGuard, AuthService],
  exports: [SupabaseAuthProvider, SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
