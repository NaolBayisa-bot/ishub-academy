import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { UserStatus } from '@ishub/shared';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsInt()
  approvedCategoryId?: number;
}
