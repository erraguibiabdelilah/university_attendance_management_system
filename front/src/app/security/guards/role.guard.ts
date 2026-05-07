import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const hasRole = (requiredRole: string): boolean => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) {
    return false;
  }

  try {
    const user = JSON.parse(userRaw);
    const authorities = user?.authorities ?? [];
    return authorities.some((role: { authority?: string } | string) => {
      if (typeof role === 'string') {
        return role === requiredRole || role === `ROLE_${requiredRole}`;
      }
      return role?.authority === requiredRole || role?.authority === `ROLE_${requiredRole}`;
    });
  } catch {
    return false;
  }
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (hasRole('ADMIN')) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
