export interface TaskStatistics {
  totalTasks: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  overdueCount: number;
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByCategory: Record<string, number>;
  upcomingTasks: DashboardTask[];
  overdueTasks: DashboardTask[];
  recentTasks: DashboardTask[];
  trend: TaskTrendPoint[];
  period: DashboardPeriod;
}

export type DashboardPeriod = 'week' | 'month' | 'all';

export interface DashboardTask {
  id: string;
  title: string;
  dueDate?: string;
  createdAt: string;
  priority: number;
  status: number;
  categoryName?: string;
}

export interface TaskTrendPoint {
  label: string;
  created: number;
  completed: number;
}
