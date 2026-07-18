import { Role } from './enums';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: Role;
  isActive?: boolean;
}