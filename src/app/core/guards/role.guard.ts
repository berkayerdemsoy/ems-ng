import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Roles, JwtPayload } from '../models';

export const roleGuard = (allowedRoles: Roles[]): CanActivateFn => () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (!token) return router.createUrlTree(['/login']);
  try {
    const { role } = jwtDecode<JwtPayload>(token);
    return allowedRoles.includes(role) ? true : router.createUrlTree(['/events']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};

