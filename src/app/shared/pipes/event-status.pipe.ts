import { Pipe, PipeTransform } from '@angular/core';
import { EventStatus } from '../../core/models';

export interface StatusDisplay {
  label: string;
  classes: string;
}

@Pipe({ name: 'eventStatus', standalone: true })
export class EventStatusPipe implements PipeTransform {
  transform(status: EventStatus): StatusDisplay {
    const map: Record<EventStatus, StatusDisplay> = {
      UPCOMING:  { label: 'Yaklaşıyor',   classes: 'bg-blue-100 text-blue-800' },
      ONGOING:   { label: 'Devam Ediyor', classes: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Tamamlandı',   classes: 'bg-gray-100 text-gray-600' },
      CANCELLED: { label: 'İptal Edildi', classes: 'bg-red-100 text-red-800' }
    };
    return map[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
  }
}

