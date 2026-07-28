import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../core/services/category.service';
import { TaskService } from '../../../core/services/task.service';
import { Category } from '../../../core/models/category.model';
import { Priority, TaskFilter, TaskItem, TaskStatus } from '../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

type TaskViewMode = 'list' | 'board';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TaskCardComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks = signal<TaskItem[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  totalCount = signal(0);
  viewMode = signal<TaskViewMode>('list');
  updatingTaskIds = signal<Set<string>>(new Set());

  filter: TaskFilter = {
    page: 1,
    pageSize: 10,
    sortBy: 'CreatedAt',
    sortDirection: 'desc'
  };

  readonly pageSizeOptions = [10, 20, 50];
  readonly skeletonArray = [1, 2, 3, 4, 5];
  readonly TaskStatus = TaskStatus;

  readonly priorities = [
    { value: Priority.Low, label: 'Düşük' },
    { value: Priority.Normal, label: 'Normal' },
    { value: Priority.High, label: 'Yüksek' },
    { value: Priority.Urgent, label: 'Acil' },
    { value: Priority.Critical, label: 'Kritik' }
  ];

  readonly statuses = [
    { value: TaskStatus.Pending, label: 'Bekliyor', icon: 'schedule' },
    { value: TaskStatus.InProgress, label: 'Devam Ediyor', icon: 'autorenew' },
    { value: TaskStatus.Completed, label: 'Tamamlandı', icon: 'check_circle' },
    { value: TaskStatus.Cancelled, label: 'İptal Edildi', icon: 'cancel' }
  ];

  readonly sortOptions = [
    { value: 'CreatedAt', label: 'Oluşturulma Tarihi' },
    { value: 'DueDate', label: 'Bitiş Tarihi' },
    { value: 'Priority', label: 'Öncelik' },
    { value: 'Status', label: 'Durum' },
    { value: 'Title', label: 'Görev Adı' }
  ];

  readonly kanbanDropListIds = this.statuses.map(status => `kanban-${status.value}`);

  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly snackBar = inject(MatSnackBar);
  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories.set(categories),
      error: () => this.snackBar.open('Kategoriler yüklenemedi.', 'Kapat', { duration: 3000 })
    });
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.getAll(this.filter).subscribe({
      next: result => {
        this.tasks.set(this.sortTasks(result.items || []));
        this.totalCount.set(result.totalCount);
        this.filter.page = result.page;
        this.filter.pageSize = result.pageSize;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Görevler yüklenemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilter(), 300);
  }

  applyFilter(): void {
    if (
      this.filter.dueDateFrom &&
      this.filter.dueDateTo &&
      this.filter.dueDateFrom > this.filter.dueDateTo
    ) {
      this.snackBar.open('"En Erken" tarihi, "En Geç" tarihinden sonra olamaz.', 'Kapat', {
        duration: 3500
      });
      return;
    }

    this.filter.page = 1;
    this.loadTasks();
  }

  onPageChange(event: PageEvent): void {
    this.filter.page = event.pageIndex + 1;
    this.filter.pageSize = event.pageSize;
    this.loadTasks();
  }

  onSortChange(): void {
    this.filter.page = 1;
    this.loadTasks();
  }

  toggleSortDirection(): void {
    this.filter.sortDirection = this.filter.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  clearFilter(): void {
    const pageSize = this.filter.pageSize || 10;
    this.filter = {
      page: 1,
      pageSize,
      sortBy: 'CreatedAt',
      sortDirection: 'desc'
    };
    this.loadTasks();
  }

  setViewMode(mode: TaskViewMode): void {
    this.viewMode.set(mode);
  }

  hasActiveFilters(): boolean {
    return Boolean(
      this.filter.categoryId ||
      this.filter.status !== undefined ||
      this.filter.priority !== undefined ||
      this.filter.searchTerm ||
      this.filter.dueDateFrom ||
      this.filter.dueDateTo
    );
  }

  getTasksByStatus(status: TaskStatus): TaskItem[] {
    return this.tasks().filter(task => task.status === status);
  }

  onTaskDrop(event: CdkDragDrop<TaskStatus>): void {
    const task = event.item.data as TaskItem;
    const newStatus = event.container.data;
    if (!task || task.status === newStatus || this.updatingTaskIds().has(task.id)) return;

    const previousTasks = this.tasks();
    this.tasks.set(previousTasks.map(item =>
      item.id === task.id ? { ...item, status: newStatus } : item
    ));
    this.setTaskUpdating(task.id, true);

    this.taskService.update(task.id, { status: newStatus }).subscribe({
      next: updatedTask => {
        this.tasks.update(items => items.map(item =>
          item.id === updatedTask.id ? updatedTask : item
        ));
        this.setTaskUpdating(task.id, false);
        this.snackBar.open(`Görev "${this.getStatusLabel(newStatus)}" durumuna taşındı.`, 'Kapat', {
          duration: 2500
        });
      },
      error: () => {
        this.tasks.set(previousTasks);
        this.setTaskUpdating(task.id, false);
        this.snackBar.open('Görev durumu güncellenemedi. Değişiklik geri alındı.', 'Kapat', {
          duration: 3500
        });
      }
    });
  }

  isTaskUpdating(taskId: string): boolean {
    return this.updatingTaskIds().has(taskId);
  }

  getCategoryColor(categoryId: string | undefined): string {
    if (!categoryId) return '#9e9e9e';
    return this.categories().find(category => category.id === categoryId)?.color || '#9e9e9e';
  }

  getPriorityLabel(priority: Priority): string {
    return this.priorities.find(item => item.value === priority)?.label || 'Bilinmiyor';
  }

  getStatusLabel(status: TaskStatus): string {
    return this.statuses.find(item => item.value === status)?.label || 'Bilinmiyor';
  }

  getPriorityClass(priority: Priority): string {
    return `priority-${Priority[priority].toLowerCase()}`;
  }

  private setTaskUpdating(taskId: string, updating: boolean): void {
    this.updatingTaskIds.update(current => {
      const next = new Set(current);
      updating ? next.add(taskId) : next.delete(taskId);
      return next;
    });
  }

  private sortTasks(tasks: TaskItem[]): TaskItem[] {
    const sortBy = this.filter.sortBy || 'CreatedAt';
    const direction = this.filter.sortDirection === 'asc' ? 1 : -1;

    return [...tasks].sort((first, second) => {
      let comparison = 0;

      switch (sortBy) {
        case 'Title':
          comparison = first.title.localeCompare(second.title, 'tr', { sensitivity: 'base' });
          break;
        case 'DueDate':
          if (!first.dueDate || !second.dueDate) {
            return this.compareMissingDates(first.dueDate, second.dueDate);
          }
          comparison = new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime();
          break;
        case 'Priority':
          comparison = first.priority - second.priority;
          break;
        case 'Status':
          comparison = first.status - second.status;
          break;
        default:
          comparison = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
      }

      return comparison * direction;
    });
  }

  private compareMissingDates(first?: string, second?: string): number {
    if (!first && !second) return 0;
    if (!first) return 1;
    if (!second) return -1;
    return 0;
  }
}
