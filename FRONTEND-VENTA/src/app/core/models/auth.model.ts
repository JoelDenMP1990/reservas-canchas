import { User } from './user.model';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}