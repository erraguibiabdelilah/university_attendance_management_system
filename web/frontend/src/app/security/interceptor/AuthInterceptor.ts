import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Ne pas ajouter le token aux routes publiques ni à Cloudinary
  const publicPaths = ['/api/uca/auth/login/', '/api/uca/auth/sign-in/', 'cloudinary.com'];
  if (publicPaths.some(p => req.url.includes(p))) {
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
