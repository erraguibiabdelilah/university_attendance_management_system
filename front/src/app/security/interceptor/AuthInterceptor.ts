import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Skip token only for authentication endpoints that must be called anonymously
  const isAnonymousAuthEndpoint =
    req.url.includes('/auth/sign-in/') || req.url.includes('/auth/login/');

  if (isAnonymousAuthEndpoint) {
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
