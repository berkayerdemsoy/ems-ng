import { Roles } from './common.models';

export interface UserCreateDto {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface UserUpdateDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  role: Roles;
  verified: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
}

