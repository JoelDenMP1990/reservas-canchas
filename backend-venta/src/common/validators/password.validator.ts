// common/validators/password.validator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          
          // Al menos 12 caracteres
          if (value.length < 12) return false;
          
          // Al menos una mayúscula
          if (!/[A-Z]/.test(value)) return false;
          
          // Al menos una minúscula
          if (!/[a-z]/.test(value)) return false;
          
          // Al menos un número
          if (!/\d/.test(value)) return false;
          
          // Al menos un carácter especial
          if (!/[@$!%*?&#]/.test(value)) return false;
          
          return true;
        },
        defaultMessage() {
          return 'Password must be at least 12 characters with uppercase, lowercase, number and special character';
        }
      }
    });
  };
}


