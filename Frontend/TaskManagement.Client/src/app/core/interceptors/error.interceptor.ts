import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        // Auto logout if 401 response returned from api (except login itself)
        authService.logout();
        location.reload();
      }

      const errorMessage = error.error?.message || error.statusText;
      console.error('API Error:', errorMessage);
      return throwError(() => error);
    })
  );
};
