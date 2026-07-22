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
}