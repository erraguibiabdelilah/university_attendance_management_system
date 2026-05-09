import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas ajouter le token aux routes auth
  if (req.url.includes('/api/uca/auth')) {
    return next(req);
  }

  const storedToken = localStorage.getItem('token');
  const token = storedToken && storedToken !== 'null' && storedToken !== 'undefined' ? storedToken.trim() : '';

  if (!token) {
    return next(req);
  }

  const authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

  return next(
    req.clone({
      setHeaders: {
        Authorization: authorization
      }
    })
  );
};
