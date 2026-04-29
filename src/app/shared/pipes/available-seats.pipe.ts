import { Pipe, PipeTransform } from '@angular/core';
import { EventResponseDto } from '../../core/models';

@Pipe({ name: 'availableSeats', standalone: true })
export class AvailableSeatsPipe implements PipeTransform {
  transform(event: Pick<EventResponseDto, 'capacity' | 'currentAttendees'>): number {
    return event.capacity - event.currentAttendees;
  }
}

