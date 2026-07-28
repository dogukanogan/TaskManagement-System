import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TaskItem, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCardComponent {
  readonly task = input.required<TaskItem>();
  readonly categoryColor = input('#9e9e9e');

  getPriorityLabel(priority: number): string {
    const labels: Record<number, string> = { 1: 'Düşük', 2: 'Normal', 3: 'Yüksek', 4: 'Acil', 5: 'Kritik' };
    return labels[priority] || 'Bilinmiyor';
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<number, string> = { 0: 'Bekliyor', 1: 'Devam Ediyor', 2: 'Tamamlandı', 3: 'İptal Edildi' };
    return labels[status] || 'Bilinmiyor';
  }

  getStatusColorClass(status: number): string {
    const classes: Record<number, string> = { 0: 'status-todo', 1: 'status-inprogress', 2: 'status-completed', 3: 'status-cancelled' };
    return classes[status] || '';
  }

  getPriorityColorClass(priority: number): string {
    const classes: Record<number, string> = { 1: 'priority-low', 2: 'priority-normal', 3: 'priority-high', 4: 'priority-urgent', 5: 'priority-critical' };
    return classes[priority] || '';
  }
}
