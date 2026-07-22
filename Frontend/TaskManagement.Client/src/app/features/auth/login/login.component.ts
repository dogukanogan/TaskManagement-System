import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public themeService = inject(ThemeService);

  credentials = {
    email: '',
    password: ''
  };

  loading = signal(false);

  /**
   * Form gönderildiğinde kullanıcı giriş işlemini tetikler ve sonucu işler.
   */
  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.snackBar.open('Lütfen tüm alanları doldurun.', 'Kapat', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.snackBar.open('Giriş başarılı, yönlendiriliyorsunuz...', 'Kapat', { duration: 2000 });
        this.router.navigate(['/tasks']);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Giriş işlemi başarısız:', err);
        this.snackBar.open('E-posta veya şifre hatalı.', 'Kapat', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
}