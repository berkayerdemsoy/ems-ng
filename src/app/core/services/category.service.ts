import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDto } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/categories`;

  getAll(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.base);
  }

  getById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.base}/${id}`);
  }

  create(dto: CategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.base, dto);
  }

  update(id: number, dto: CategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

