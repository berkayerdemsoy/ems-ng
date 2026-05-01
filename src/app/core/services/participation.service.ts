import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ParticipationCreateDto, ParticipationResponseDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/participations`;

  register(dto: ParticipationCreateDto): Observable<ParticipationResponseDto> {
    return this.http.post<ParticipationResponseDto>(this.base, dto);
  }

  getByEvent(eventId: number): Observable<ParticipationResponseDto[]> {
    return this.http.get<ParticipationResponseDto[]>(`${this.base}/event/${eventId}`);
  }

  getMyTickets(): Observable<ParticipationResponseDto[]> {
    return this.http.get<ParticipationResponseDto[]>(`${this.base}/my-tickets`);
  }
}

