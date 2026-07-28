import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Category } from '../../core/models/category.model';
import {
  DashboardPeriod,
  DashboardTask,
  TaskStatistics,
  TaskTrendPoint
} from '../../core/models/statistics.model';
import { CategoryService } from '../../core/services/category.service';
import { StatisticsService } from '../../core/services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly statisticsService = inject(StatisticsService);
  private readonly categoryService = inject(CategoryService);

  readonly stats = signal<TaskStatistics | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedPeriod = signal<DashboardPeriod>('all');

  readonly periods: Array<{ value: DashboardPeriod; label: string }> = [
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'all', label: 'Tümü' }
  ];

  ngOnInit(): void {
    this.loadStatistics();
    this.loadCategories();
  }

  selectPeriod(period: DashboardPeriod): void {
    if (period === this.selectedPeriod()) return;
    this.selectedPeriod.set(period);
    this.loadStatistics();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories.set(categories),
      error: error => console.error('Kategoriler yüklenemedi', error)
    });
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.error.set('');

    this.statisticsService.get(this.selectedPeriod()).subscribe({
      next: statistics => {
        this.stats.set(statistics);
        this.loading.set(false);
      },
      error: error => {
        console.error('İstatistikler yüklenirken hata:', error);
        this.error.set('İstatistikler yüklenirken bir sorun oluştu.');
        this.loading.set(false);
      }
    });
  }

  getPriorityKeys(record: Record<string, number>): string[] {
    return Object.keys(record);
  }

  getCategoryKeys(record: Record<string, number>): string[] {
    return Object.keys(record);
  }

  getPriorityLabel(priority: string | number): string {
    const map: Record<string, string> = {
      Low: 'Düşük',
      Normal: 'Normal',
      High: 'Yüksek',
      Urgent: 'Acil',
      Critical: 'Kritik',
      '1': 'Düşük',
      '2': 'Normal',
      '3': 'Yüksek',
      '4': 'Acil',
      '5': 'Kritik'
    };
    return map[String(priority)] || String(priority);
  }

  getPriorityColorClass(priority: string | number): string {
    const map: Record<string, string> = {
      Low: 'priority-low',
      Normal: 'priority-normal',
      High: 'priority-high',
      Urgent: 'priority-urgent',
      Critical: 'priority-critical',
      '1': 'priority-low',
      '2': 'priority-normal',
      '3': 'priority-high',
      '4': 'priority-urgent',
      '5': 'priority-critical'
    };
    return map[String(priority)] || '';
  }

  getCategoryColorByName(categoryName: string): string {
    return this.categories().find(category => category.name === categoryName)?.color || '#9e9e9e';
  }

  getTrendHeight(value: number, trend: TaskTrendPoint[]): number {
    const maximum = Math.max(1, ...trend.flatMap(point => [point.created, point.completed]));
    return value === 0 ? 2 : Math.max(8, Math.round(value / maximum * 100));
  }

  trackTask(_: number, task: DashboardTask): string {
    return task.id;
  }

  trackTrend(_: number, point: TaskTrendPoint): string {
    return point.label;
  }
}
