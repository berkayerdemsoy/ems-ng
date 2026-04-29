import { EventStatus } from './common.models';
import { CategoryDto } from './category.models';

export interface EventCreateDto {
  title: string;
  description: string;
  address: string;
  city: string;
  capacity: number;
  price: number;
  categoryId: number;
  startDate: string;
  endDate: string;
}

export interface EventUpdateDto {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  capacity?: number;
  price?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface EventResponseDto {
  id: number;
  title: string;
  description: string;
  ownerId: number;
  ownerEmail: string;
  address: string;
  city: string;
  capacity: number;
  currentAttendees: number;
  price: number;
  status: EventStatus;
  category: CategoryDto;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

