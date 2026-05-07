import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserCreateDto, UserUpdateDto, UserResponseDto } from '../models';
import { Page } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/users`;

  create(dto: UserCreateDto): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.base}/create`, dto);
  }

  getById(id: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.base}/id/${id}`);
  }

  getByUsername(username: string): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.base}/username/${username}`);
  }

  update(id: number, dto: UserUpdateDto): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.base}/update/${id}`, dto);
  }

  requestVerification(id: number): Observable<string> {
    return this.http.post<string>(`${this.base}/verify-email/${id}`, null);
  }

  confirmEmail(token: string): Observable<string> {
    const params = new HttpParams().set('token', token);
    // responseType: 'text' prevents Angular from trying to JSON-parse a plain-text
    // success response — without it a 200 OK with a plain-text body triggers the
    // error handler (JSON SyntaxError) even though the DB was updated successfully.
    return this.http.get(`${this.base}/confirm-email`, { params, responseType: 'text' });
  }

  becomeOwner(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/owner/${id}`, null);
  }

  getAll(page = 0, size = 20): Observable<Page<UserResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<UserResponseDto>>(`${this.base}/all`, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

