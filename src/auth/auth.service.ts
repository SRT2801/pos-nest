import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { Role } from './enums/role.enum.js';
import { ADMIN_DEFAULT_PERMISSIONS } from './enums/permission.enum.js';
import { StoresService } from '../stores/stores.service';
import { RegisterStoreDto } from './dto/register-store.dto';
import { StoreContextService } from '../common/cls/store-context.service';
import type { Response, Request } from 'express';
import { Res } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_AUTH') private readonly supabase: SupabaseClient,
    private readonly storesService: StoresService,
    private readonly storeContext: StoreContextService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    return this.createUser(signUpDto, Role.CUSTOMER);
  }

  async createMember(createMemberDto: CreateMemberDto) {
    const { email, password, role, permissions } = createMemberDto;

    const storeId = this.storeContext.getStoreId();
    if (!storeId) {
      throw new BadRequestException('X-Store-ID header is required');
    }

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: Role.STAFF },
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    await this.storesService.addUserToStore(
      data.user.id,
      storeId,
      role,
      permissions,
    );

    return {
      message: `${role} created and added to store successfully`,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      storeRole: role,
      permissions:
        role === Role.ADMIN ? ADMIN_DEFAULT_PERMISSIONS : (permissions ?? []),
    };
  }

  async signIn(signInDto: SignInDto, @Res() res: Response) {
    const { email, password } = signInDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message === 'Invalid login credentials' ||
        error.message.toLowerCase().includes('invalid login credentials')
      ) {
        throw new UnauthorizedException('Credenciales no válidas');
      }
      throw new UnauthorizedException(error.message);
    }

    const storeUsers = await this.storesService.findStoresForUser(data.user.id);

    res.cookie('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });

    res.cookie('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });

    return res.json({
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email,
        globalRole: data.user.app_metadata?.role || Role.CUSTOMER,
      },
      stores: storeUsers.map((su) => ({
        id: su.storeId,
        name: su.store.name,
        slug: su.store.slug,
        role: su.role,
      })),
    });
  }

  async signOut(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ message: 'Logout Successful' });
  }

  async registerStore(registerDto: RegisterStoreDto) {
    const { email, password, storeName, storeSlug } = registerDto;

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: Role.OWNER },
      email_confirm: true,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const store = await this.storesService.create(
      { name: storeName, slug: storeSlug },
      data.user.id,
    );

    return {
      message: 'Store registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
    };
  }

  private async createUser(
    credentials: { email: string; password: string },
    role: Role,
  ) {
    const { email, password } = credentials;

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role },
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

  async refresh(res: Response, req: Request) {
    
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

  
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res
        .status(401)
        .json({ message: 'Refresh token inválido o expirado' });
    }

   
    res.cookie('access_token', data.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });
    res.cookie('refresh_token', data.session?.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ message: 'Token refrescado correctamente' });
  }
}
