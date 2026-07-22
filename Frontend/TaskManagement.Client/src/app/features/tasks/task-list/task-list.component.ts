import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { TaskItem, Priority, TaskStatus, TaskFilter } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks = signal<TaskItem[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);

  filter: TaskFilter = {};
  
  Priority = Priority;
  TaskStatus = TaskStatus;

  // Enums as arrays for dropdowns
  priorities = [
    { value: Priority.Low, label: 'Düşük' },
    { value: Priority.Normal, label: 'Normal' },
    { value: Priority.High, label: 'Yüksek' },
    { value: Priority.Urgent, label: 'Acil' },
    { value: Priority.Critical, label: 'Kritik' }
  ];

  statuses = [
    { value: TaskStatus.Pending, label: 'Bekliyor' },
    { value: TaskStatus.InProgress, label: 'Devam Ediyor' },
    { value: TaskStatus.Completed, label: 'Tamamlandı' },
    { value: TaskStatus.Cancelled, label: 'İptal Edildi' }
  ];

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.getAll(this.filter).subscribe({
      next: (data) => {
        // İstemci tarafında sıralama: 
        // 1. Tamamlananlar en altta
        // 2. Kalanlar kendi içinde önceliğe göre (Kritik -> Düşük)
        const sortedData = data.sort((a, b) => {
          if (a.status === 2 && b.status !== 2) return 1;
          if (a.status !== 2 && b.status === 2) return -1;
          
          // İkisi de tamamlanmışsa veya ikisi de tamamlanmamışsa önceliğe göre sırala (Büyükten küçüğe)
          return b.priority - a.priority;
        });

        this.tasks.set(sortedData);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  searchTimeout: any;

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilter();
    }, 300);
  }

  applyFilter(): void {
    this.loadTasks();
  }

  clearFilter(): void {
    this.filter = {};
    this.loadTasks();
  }

  getPriorityLabel(priority: number): string {
    const labels: Record<number, string> = { 1: 'Düşük', 2: 'Normal', 3: 'Yüksek', 4: 'Acil', 5: 'Kritik' };
    return labels[priority] || 'Bilinmiyor';
  }

  getStatusColorClass(status: number): string {
    switch (status) {
        case 0: return 'status-todo';
        case 1: return 'status-inprogress';
        case 2: return 'status-completed';
        case 3: return 'status-cancelled';
        default: return '';
    }
  }

  getPriorityColorClass(priority: number): string {
    switch (priority) {
        case 1: return 'priority-low';
        case 2: return 'priority-normal';
        case 3: return 'priority-high';
        case 4: return 'priority-urgent';
        case 5: return 'priority-critical';
        default: return '';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : TaskStatus[status];
  }

  getCategoryColor(categoryId: string | undefined): string {
    if (!categoryId) return '#9e9e9e'; // Default grey for unassigned
    const cat = this.categories().find(c => c.id === categoryId);
    return cat && cat.color ? cat.color : '#9e9e9e';
  }
}