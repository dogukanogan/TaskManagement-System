import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { StatisticsService } from '../../core/services/statistics.service';
import { TaskStatistics } from '../../core/models/statistics.model';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private statisticsService = inject(StatisticsService);
  private categoryService = inject(CategoryService);
  
  stats = signal<TaskStatistics | null>(null);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadStatistics();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Kategoriler yüklenemedi', err)
    });
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.error.set('');
    
    this.statisticsService.get().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('İstatistikler yüklenirken hata:', err);
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

  getPriorityLabel(priorityString: string): string {
    const map: Record<string, string> = {
      'Low': 'Düşük',
      'Normal': 'Normal',
      'High': 'Yüksek',
      'Urgent': 'Acil',
      'Critical': 'Kritik',
      '1': 'Düşük',
      '2': 'Normal',
      '3': 'Yüksek',
      '4': 'Acil',
      '5': 'Kritik'
    };
    return map[priorityString] || priorityString;
  }

  getPriorityColorClass(priorityString: string): string {
    const map: Record<string, string> = {
      'Low': 'priority-low',
      'Normal': 'priority-normal',
      'High': 'priority-high',
      'Urgent': 'priority-urgent',
      'Critical': 'priority-critical',
      '1': 'priority-low',
      '2': 'priority-normal',
      '3': 'priority-high',
      '4': 'priority-urgent',
      '5': 'priority-critical'
    };
    return map[priorityString] || '';
  }

  getCategoryColorByName(categoryName: string): string {
    const cat = this.categories().find(c => c.name === categoryName);
    return cat && cat.color ? cat.color : '#9e9e9e';
  }
}
