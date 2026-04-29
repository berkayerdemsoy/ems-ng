import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventCreateDto, EventUpdateDto, EventResponseDto } from '../models';
import { Page } from '../models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/events`;

  getAll(page = 0, size = 20): Observable<Page<EventResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<EventResponseDto>>(this.base, { params });
  }

  getById(id: number): Observable<EventResponseDto> {
    return this.http.get<EventResponseDto>(`${this.base}/${id}`);
  }

  create(dto: EventCreateDto): Observable<EventResponseDto> {
    return this.http.post<EventResponseDto>(this.base, dto);
  }

  update(id: number, dto: EventUpdateDto): Observable<EventResponseDto> {
    return this.http.put<EventResponseDto>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getByCategory(categoryId: number, page = 0, size = 20): Observable<Page<EventResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<EventResponseDto>>(`${this.base}/category/${categoryId}`, { params });
  }

  getByCity(city: string, page = 0, size = 20): Observable<Page<EventResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<EventResponseDto>>(`${this.base}/city/${city}`, { params });
  }

  getByDateRange(start: string, end: string, page = 0, size = 20): Observable<Page<EventResponseDto>> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<EventResponseDto>>(`${this.base}/date-range`, { params });
  }
}

