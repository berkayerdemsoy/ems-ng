import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { UserResponseDto, UserLoginDto, AuthResponseDto } from '../models';
import { JwtPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiBaseUrl}/users`;

  private readonly currentUserSignal = signal<UserResponseDto | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isVerified = computed(() => this.currentUser()?.verified ?? false);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  constructor() {
    // Sekmeler arası (Cross-tab) oturum senkronizasyonu
    window.addEventListener('storage', (event) => {
      // Sadece token değiştiğinde tetiklensin
      if (event.key === 'token') {
        if (event.newValue) {
          // Durum 1: Başka bir sekmede yeni giriş yapıldı veya mail doğrulanıp yeni token alındı.
          // Mevcut initFromStorage metodunuzu çağırarak yeni tokenı okuyup kullanıcıyı güncelliyoruz.
          this.initFromStorage();
        } else {
          // Durum 2: Başka bir sekmede çıkış yapıldı (token silindi).
          // LocalStorage zaten diğer sekmeden silindiği için sadece Signal'i temizleyip Login'e atıyoruz.
          this.currentUserSignal.set(null);
          sessionStorage.removeItem('verificationSent');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  initFromStorage(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve();
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.exp * 1000 < Date.now()) {
        this.clearSession();
        return Promise.resolve();
      }
      return new Promise<void>(resolve => {
        this.http.get<UserResponseDto>(`${this.base}/id/${payload.sub}`).subscribe({
          next: user => { this.currentUserSignal.set(user); resolve(); },
          error: () => { this.clearSession(); resolve(); }
        });
      });
    } catch {
      this.clearSession();
      return Promise.resolve();
    }
  }

  login(dto: UserLoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.base}/login`, dto).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.currentUserSignal.set(res.user);
      })
    );
  }

  logout(returnUrl?: string): void {
    this.clearSession();
    this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : {});
  }

  refreshUser(id: number): void {
    this.http.get<UserResponseDto>(`${this.base}/id/${id}`).subscribe(
      user => this.currentUserSignal.set(user)
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUser(user: UserResponseDto): void {
    this.currentUserSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('verificationSent');
    this.currentUserSignal.set(null);
  }
}

