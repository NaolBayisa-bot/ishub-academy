import { IsEmail, IsString, MinLength, MaxLength, IsInt, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  department: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  academicYear: string;

  @IsInt()
  preferredCategoryId: number;
}
