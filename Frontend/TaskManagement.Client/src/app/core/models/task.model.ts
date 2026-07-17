export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export enum TaskPriority {
  Low = 1,
  Normal = 2,
  High = 3,
  Urgent = 4,
  Critical = 5
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  categoryId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
}
