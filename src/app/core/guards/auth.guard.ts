import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
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

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.routerState.snapshot.url }
  });
};

