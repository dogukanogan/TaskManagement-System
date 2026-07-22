import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { CategoryDialogComponent } from '../../categories/category-dialog/category-dialog.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  providers: [DatePipe]
})
export class TaskFormComponent implements OnInit {
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private dialog = inject(MatDialog);

  categories = signal<Category[]>([]);
  loading = signal(false);
  submitting = signal(false);

  isEditMode = signal(false);
  taskId = signal<string | null>(null);

  taskData = {
    title: '',
    description: '',
    dueDate: '', 
    priority: 2,
    categoryId: null as string | null
  };

  priorities = [
    { value: 1, label: 'Düşük' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Yüksek' },
    { value: 4, label: 'Acil' },
    { value: 5, label: 'Kritik' }
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Kategoriler yüklenirken hata oluştu!', 'Kapat', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openNewCategoryDialog() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: null,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.create(result).subscribe({
          next: (newCategory: Category) => {
            this.snackBar.open('Kategori eklendi!', 'Kapat', { duration: 3000 });
            this.loadCategories();
            this.taskData.categoryId = newCategory.id;
          },
          error: (err: any) => {
            console.error('Kategori eklenemedi:', err);
            this.snackBar.open('Kategori eklenirken hata oluştu.', 'Kapat', { duration: 3000 });
          }
        });
      }
    });
  }

  editSelectedCategory(event: Event) {
    event.stopPropagation();
    if (!this.taskData.categoryId) return;
    
    const catToEdit = this.categories().find(c => c.id === this.taskData.categoryId);
    if (!catToEdit) return;

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: { id: catToEdit.id, name: catToEdit.name, color: catToEdit.color },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        this.categoryService.update(result.id, result).subscribe({
          next: () => {
            this.snackBar.open('Kategori rengi/adı güncellendi!', 'Kapat', { duration: 3000 });
            this.loadCategories();
          },
          error: (err: any) => {
            console.error('Kategori güncellenemedi:', err);
            this.snackBar.open('Kategori güncellenirken hata oluştu.', 'Kapat', { duration: 3000 });
          }
        });
      }
    });
  }

  checkEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.taskId.set(id);
        this.loadTask(id);
      }
    });
  }

  loadTask(id: string): void {
    this.loading.set(true);
    this.taskService.getById(id).subscribe({
      next: (task) => {
        this.taskData = {
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate ? this.datePipe.transform(task.dueDate, 'yyyy-MM-dd') || '' : '',
          priority: task.priority,
          categoryId: task.categoryId || null
        };
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Görev yüklenirken hata oluştu!', 'Kapat', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/tasks']);
      }
    });
  }

  cancel(): void {
    if (this.isEditMode() && this.taskId()) {
      this.router.navigate(['/tasks', this.taskId()]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  onSubmit(): void {
    if (!this.taskData.title || !this.taskData.categoryId) {
      this.snackBar.open('Lütfen zorunlu alanları doldurun!', 'Kapat', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    
    const payload = {
      title: this.taskData.title,
      description: this.taskData.description,
      priority: this.taskData.priority,
      categoryId: String(this.taskData.categoryId),
      dueDate: this.taskData.dueDate ? new Date(this.taskData.dueDate).toISOString() : undefined
    };

    if (this.isEditMode() && this.taskId()) {
      this.taskService.update(this.taskId()!, payload).subscribe({
        next: () => {
          this.snackBar.open('Görev başarıyla güncellendi!', 'Kapat', { duration: 3000 });
          this.submitting.set(false);
          this.router.navigate(['/tasks', this.taskId()]);
        },
        error: (err) => {
          console.error('Task güncelleme hatası:', err);
          this.snackBar.open('Görev güncellenemedi!', 'Kapat', { duration: 3000 });
          this.submitting.set(false);
        }
      });
    } else {
      this.taskService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Görev başarıyla oluşturuldu!', 'Kapat', { duration: 3000 });
          this.submitting.set(false);
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          console.error('Task oluşturma hatası:', err);
          this.snackBar.open('Görev oluşturulamadı!', 'Kapat', { duration: 3000 });
          this.submitting.set(false);
        }
      });
    }
  }
}