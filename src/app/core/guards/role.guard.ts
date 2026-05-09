import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorToastService } from '../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../services/i18n.service';
import { Roles } from '../models';

export const roleGuard = (allowedRoles: Roles[]): CanActivateFn => () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ErrorToastService);
  const i18n = inject(I18nService);

  const role = auth.role() as Roles | null;
  if (!role) return router.createUrlTree(['/login']);

  if (allowedRoles.includes(role)) return true;

  toast.show(i18n.t('guard.noAccess'), 'error');
  return router.createUrlTree(['/events']);
};

