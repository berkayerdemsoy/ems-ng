import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models';
import { ErrorToastService } from '../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../services/i18n.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toast = inject(ErrorToastService);
  const i18n = inject(I18nService);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.exp * 1000 > Date.now()) {
        return true;
      }
    } catch {
      // malformed token — fall through to redirect
    }
    // Token exists but is expired — clear it and redirect
    localStorage.removeItem('token');
    sessionStorage.removeItem('verificationSent');
  }

  toast.show(i18n.t('guard.loginRequired'), 'info');

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.routerState.snapshot.url }
  });
};

