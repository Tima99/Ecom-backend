import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  password: string;

  @IsString()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;
}
