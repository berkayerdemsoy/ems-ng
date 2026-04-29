import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorToastService } from '../../shared/components/error-toast/error-toast.service';
import { ErrorResponseDto } from '../models';

const PUBLIC_URLS = ['/users/create', '/users/login', '/users/confirm-email'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ErrorToastService);

  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
  const token = localStorage.getItem('token');

  const authReq = (token && !isPublic)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 403) {
        auth.logout();
        toast.show('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', 'error');
      } else if (err.status === 404) {
        toast.show('Kaynak bulunamadı.', 'error');
      } else if (err.status === 500) {
        toast.show('Bir sunucu hatası oluştu.', 'error');
      }
      return throwError(() => (err.error as ErrorResponseDto) ?? err);
    })
  );
};

