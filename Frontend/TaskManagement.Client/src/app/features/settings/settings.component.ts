import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../core/services/user.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CategoryDialogComponent } from '../categories/category-dialog/category-dialog.component';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private userService = inject(UserService);
  public themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  // Profile Form
  profileData = {
    firstName: '',
    lastName: ''
  };
  isUpdatingProfile = signal(false);

  // Password Form
  passwordData = {
    currentPassword: '',
    newPassword: ''
  };
  isUpdatingPassword = signal(false);

  // Categories
  categories = signal<Category[]>([]);
  isLoadingCategories = signal(false);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileData.firstName = user.firstName;
      this.profileData.lastName = user.lastName;
    }
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.snackBar.open('Kategoriler yüklenirken hata oluştu', 'Kapat', { duration: 3000 });
        this.isLoadingCategories.set(false);
      }
    });
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: category ? { id: category.id, name: category.name, color: category.color } : null,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.categoryService.update(result.id, result).subscribe({
            next: () => {
              this.snackBar.open('Kategori güncellendi', 'Kapat', { duration: 3000 });
              this.loadCategories();
            },
            error: () => this.snackBar.open('Kategori güncellenemedi', 'Kapat', { duration: 3000 })
          });
        } else {
          this.categoryService.create(result).subscribe({
            next: () => {
              this.snackBar.open('Kategori eklendi', 'Kapat', { duration: 3000 });
              this.loadCategories();
            },
            error: () => this.snackBar.open('Kategori eklenemedi', 'Kapat', { duration: 3000 })
          });
        }
      }
    });
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Kategoriyi Sil',
        message: `"${category.name}" kategorisini silmek istediğinize emin misiniz? Bu kategoriye ait görevler kategorisiz olarak kalacaktır.`,
        confirmText: 'Sil'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.delete(category.id).subscribe({
          next: () => {
            this.snackBar.open('Kategori silindi', 'Kapat', { duration: 3000 });
            this.loadCategories();
          },
          error: () => this.snackBar.open('Kategori silinemedi', 'Kapat', { duration: 3000 })
        });
      }
    });
  }

  updateProfile(): void {
    if (!this.profileData.firstName || !this.profileData.lastName) return;

    this.isUpdatingProfile.set(true);
    this.userService.updateProfile({
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName
    }).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Profil güncellendi!', 'Tamam', { duration: 3000 });
        this.isUpdatingProfile.set(false);
        // Update stored user
        if (res.user) {
          this.authService.updateStoredUser(res.user);
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Bir hata oluştu.', 'Tamam', { duration: 3000 });
        this.isUpdatingProfile.set(false);
      }
    });
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) return;

    this.isUpdatingPassword.set(true);
    this.userService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Şifre başarıyla değiştirildi!', 'Tamam', { duration: 3000 });
        this.isUpdatingPassword.set(false);
        this.passwordData = { currentPassword: '', newPassword: '' };
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Şifre değiştirilirken hata oluştu.', 'Tamam', { duration: 3000 });
        this.isUpdatingPassword.set(false);
      }
    });
  }
}
