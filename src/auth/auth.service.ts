import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_AUTH') private readonly supabase: SupabaseClient,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: 'user' },
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.app_metadata?.role,
      },
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.app_metadata?.role,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const { email, password } = createAdminDto;

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: 'admin' },
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Admin user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.app_metadata?.role,
      },
    };
  }
}
