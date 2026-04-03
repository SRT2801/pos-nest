import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsArray,
} from 'class-validator';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

export class CreateMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Password must be at least 10 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;

  @IsEnum([Role.ADMIN, Role.STAFF], {
    message: 'role must be admin or staff',
  })
  @IsNotEmpty()
  role: Role.ADMIN | Role.STAFF;

  @IsOptional()
  @IsArray()
  @IsEnum(Permission, { each: true, message: 'Invalid permission value' })
  permissions?: Permission[];
}
