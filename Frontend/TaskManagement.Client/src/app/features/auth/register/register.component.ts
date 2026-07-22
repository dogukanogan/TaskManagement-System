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
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
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
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public themeService = inject(ThemeService);

  registerData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loading = signal(false);

  /**
   * Yeni kullanıcı kayıt formunu işler ve sunucuya iletir.
   * Şifre eşleşme kontrolü istemci tarafında yapılır.
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.snackBar.open('Şifreler birbiriyle eşleşmiyor.', 'Kapat', { duration: 3000 });
      return;
    }

    this.loading.set(true);

    const payload = {
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.snackBar.open('Kayıt işlemi başarılı. Giriş yapabilirsiniz.', 'Kapat', { duration: 3000 });
        this.router.navigate(['/login']);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Kayıt işlemi başarısız:', err);
        this.snackBar.open('Kayıt oluşturulamadı. Lütfen bilgilerinizi kontrol edin.', 'Kapat', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Formdaki zorunlu alanların doldurulup doldurulmadığını denetler.
   */
  private isFormValid(): boolean {
    const { firstName, lastName, username, email, password, confirmPassword } = this.registerData;
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      this.snackBar.open('Lütfen tüm zorunlu alanları doldurun.', 'Kapat', { duration: 3000 });
      return false;
    }
    return true;
  }
}