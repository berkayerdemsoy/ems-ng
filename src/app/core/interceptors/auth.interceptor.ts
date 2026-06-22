import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, EMPTY } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth.service';
import { ErrorToastService } from '../../shared/components/error-toast/error-toast.service';
import { ErrorResponseDto, JwtPayload } from '../models';

interface PublicEndpoint {
  url: string;
  methods: string[];
}

const PUBLIC_ENDPOINTS: PublicEndpoint[] = [
  { url: '/users/create', methods: ['POST'] },
  { url: '/users/login', methods: ['POST'] },
  { url: '/users/confirm-email', methods: ['GET'] },
  { url: '/events', methods: ['GET'] },
  { url: '/categories', methods: ['GET'] },
];

/** URLs whose errors are handled by the component — suppress global toasts. */
const SILENT_ERROR_URLS = ['/users/confirm-email', '/users/login', '/users/create'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ErrorToastService);

  const isPublic = PUBLIC_ENDPOINTS.some(
    ep => req.url.includes(ep.url) && ep.methods.includes(req.method)
  );
  const isSilent = SILENT_ERROR_URLS.some(url => req.url.includes(url));
  const token = localStorage.getItem('token');

  // Proactive expiry check — cancel the request before it even reaches the server
  if (token && !isPublic) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.exp * 1000 <= Date.now()) {
        toast.show('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', 'error');
        auth.logout();
        return EMPTY;
      }
    } catch {
      // Malformed token — treat as expired
      auth.logout();
      return EMPTY;
    }
  }

  const authReq = (token && !isPublic)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!isSilent) {
        if (err.status === 401) {
          toast.show('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', 'error');
          auth.logout();
        } else if (err.status === 403) {
          toast.show('Bu işlemi yapmaya yetkiniz yok.', 'error');
        } else if (err.status === 404) {
          toast.show('Kaynak bulunamadı.', 'error');
        } else if (err.status === 500) {
          toast.show('Bir sunucu hatası oluştu.', 'error');
        }
      }
      // Re-throw the parsed DTO when available; fall back to the raw HttpErrorResponse
      // so callers can always read .status as a reliable fallback.
      return throwError(() => (err.error as ErrorResponseDto) ?? err);
    })
  );
};

