import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsEnum,
  Matches,
  MinLength,
  IsStrongPassword,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    example: 'MyP@ssw0rd123!',
    description: 'Password must contain at least 12 characters, one uppercase, one lowercase, one number and one special character'
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { 
      message: 'Password must contain uppercase, lowercase, number and special character (@$!%*?&)' 
    }
  )
    @IsStrongPassword()
  @MinLength(12)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name is too long' })
  fullName: string;

  @ApiProperty({ enum: Role, example: Role.VIEWER })
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}