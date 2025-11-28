import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({
    description: 'One-time password',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  otp: string;
}
