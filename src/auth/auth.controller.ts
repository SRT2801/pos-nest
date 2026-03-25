import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { RegisterStoreDto } from './dto/register-store.dto.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { Role } from './enums/role.enum.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @Public()
  signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    return this.authService.signIn(signInDto, res);
  }

  @Post('signout')
  @Public()
  signOut(@Res() res: Response) {
    return this.authService.signOut(res);
  }

  @Post('refresh')
  @Public()
  refresh(@Res() res: Response, @Req() req: Request) {
    return this.authService.refresh(res, req);
  }

  @Post('register-store')
  @Public()
  registerStore(@Body() registerStoreDto: RegisterStoreDto) {
    return this.authService.registerStore(registerStoreDto);
  }

  @Post('create-member')
  @Roles(Role.OWNER)
  createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.createMember(createMemberDto);
  }
}
