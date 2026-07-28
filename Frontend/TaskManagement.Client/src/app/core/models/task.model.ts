export enum Priority {
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4,
    Critical = 5
}

export enum TaskStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    status: TaskStatus;
    dueDate?: string;
    completedAt?: string;
    categoryId?: string;
    categoryName?: string;
    createdAt: string;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    categoryId?: string;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string;
    categoryId?: string;
}

export interface TaskFilter {
    status?: TaskStatus;
    priority?: Priority;
    categoryId?: string;
    searchTerm?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    overdue?: boolean;
    period?: 'week' | 'month' | 'all';
    page?: number;
    pageSize?: number;
    sortBy?: 'CreatedAt' | 'Title' | 'DueDate' | 'Priority' | 'Status';
    sortDirection?: 'asc' | 'desc';
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
