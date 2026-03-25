import { IsArray, IsEnum } from 'class-validator';
import { Permission } from '../../auth/enums/permission.enum';

export class UpdateMemberPermissionsDto {
  @IsArray()
  @IsEnum(Permission, { each: true, message: 'Invalid permission value' })
  permissions: Permission[];
}
