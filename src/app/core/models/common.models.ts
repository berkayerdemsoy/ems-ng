export type Roles = 'USER' | 'ADMIN' | 'EVENT_OWNER';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ErrorResponseDto {
  errorCode: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: Roles;
  iat: number;
  exp: number;
}

