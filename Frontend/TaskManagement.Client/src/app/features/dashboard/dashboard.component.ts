import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { StatisticsService, TaskStats } from '../../core/services/statistics.service';
import { TaskItem, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  statsService = inject(StatisticsService);

  currentUser: any;

  stats: TaskStats = {
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  };

  recentTasks: TaskItem[] = [];
  overdueTasks: TaskItem[] = [];
  isLoadingStats = true;
  isLoadingTasks = true;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    this.isLoadingStats = true;
    this.isLoadingTasks = true;

    this.statsService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
      },
      error: () => this.isLoadingStats = false
    });

    this.taskService.getTasks(undefined, undefined, undefined, 1, 5).subscribe({
      next: (res) => {
        this.recentTasks = res.items;
        this.isLoadingTasks = false;
      },
      error: () => this.isLoadingTasks = false
    });

    this.taskService.getOverdueTasks().subscribe({
      next: (res) => {
        this.overdueTasks = res.items;
      },
      error: (err) => {
        console.error('Overdue tasks loading failed:', err);
      }
    });
  }

  getPriorityLabel(priority: TaskPriority): string {
    const map: Record<number, string> = {
      [TaskPriority.Low]: 'Düşük',
      [TaskPriority.Normal]: 'Normal',
      [TaskPriority.High]: 'Yüksek',
      [TaskPriority.Urgent]: 'Acil',
      [TaskPriority.Critical]: 'Kritik'
    };
    return map[priority] || 'Normal';
  }

  getStatusLabel(status: TaskStatus): string {
    const map: Record<number, string> = {
      [TaskStatus.Pending]: 'Bekleyen',
      [TaskStatus.InProgress]: 'Devam Eden',
      [TaskStatus.Completed]: 'Tamamlanan',
      [TaskStatus.Cancelled]: 'İptal'
    };
    return map[status] || 'Bekleyen';
  }

  getPriorityColor(priority: TaskPriority): string {
    const map: Record<number, string> = {
      [TaskPriority.Low]: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      [TaskPriority.Normal]: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
      [TaskPriority.High]: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
      [TaskPriority.Urgent]: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
      [TaskPriority.Critical]: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800/50'
    };
    return map[priority] || map[TaskPriority.Normal];
  }

  getStatusColor(status: TaskStatus): string {
    const map: Record<number, string> = {
      [TaskStatus.Pending]: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      [TaskStatus.InProgress]: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
      [TaskStatus.Completed]: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
      [TaskStatus.Cancelled]: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
    };
    return map[status] || map[TaskStatus.Pending];
  }
}
