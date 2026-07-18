
import { IsEmail, IsNotEmpty, IsString, MinLength, IsStrongPassword} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@system.com', description: 'User email' })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;
  @IsStrongPassword()
@MinLength(12)
  @ApiProperty({ example: 'Admin12346@.!', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Password es requerida' })
  @Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  { message: 'La contraseña debe contener letras mayúsculas, minúsculas, números y un carácter especial' }
)
@MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password: string;
}