import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string; // base64

  @IsOptional()
  @IsString()
  @MinLength(10)
  bio?: string;

  @IsString()
  @IsIn(['pareja'])
  lookingFor: string;
} 