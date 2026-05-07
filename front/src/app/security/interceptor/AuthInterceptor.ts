import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Ne pas ajouter le token aux routes auth
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token && token !== 'null' && token !== 'undefined') {

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
