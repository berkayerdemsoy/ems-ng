import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isVerified()
    ? true
    : inject(Router).createUrlTree(['/profile']);
};

