import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const teacherGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token) { router.navigate(['/login']); return false; }

  const user = userStr ? JSON.parse(userStr) : null;
  if (user?.role === 'TEACHER' || user?.role === 'ADMIN') return true;

  router.navigate(['/dashboard']);
  return false;
};
