import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token süresi dolmuş veya geçersiz
          this.authService.logout();
          this.snackBar.open('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', 'Kapat', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}
