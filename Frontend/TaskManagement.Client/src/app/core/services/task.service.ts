import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskItem, CreateTaskRequest, UpdateTaskRequest, TaskFilter, PagedResult } from '../models/task.model';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/Task`;

  constructor(private http: HttpClient, private cache: ApiCacheService) {}

  getAll(filter?: TaskFilter): Observable<PagedResult<TaskItem>> {
    let params = new HttpParams();

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          let queryValue = value.toString();

          if (key === 'dueDateFrom' && /^\d{4}-\d{2}-\d{2}$/.test(queryValue)) {
            queryValue = this.toLocalDayBoundary(queryValue, false);
          }

          if (key === 'dueDateTo' && /^\d{4}-\d{2}-\d{2}$/.test(queryValue)) {
            queryValue = this.toLocalDayBoundary(queryValue, true);
          }

          params = params.set(key.charAt(0).toUpperCase() + key.slice(1), queryValue);
        }
      });
    }

    const cacheKey = `tasks:list:${params.toString()}`;
    return this.cache.getOrSet(
      cacheKey,
      () => this.http.get<PagedResult<TaskItem>>(this.apiUrl, { params }),
      15_000
    );
  }

  getById(id: string): Observable<TaskItem> {
    return this.cache.getOrSet(
      `tasks:detail:${id}`,
      () => this.http.get<TaskItem>(`${this.apiUrl}/${id}`),
      15_000
    );
  }

  create(data: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, data).pipe(tap(() => this.invalidateTaskCache()));
  }

  update(id: string, data: UpdateTaskRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, data).pipe(tap(() => this.invalidateTaskCache()));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateTaskCache()));
  }

  private toLocalDayBoundary(dateValue: string, endOfDay: boolean): string {
    const [year, month, day] = dateValue.split('-').map(Number);
    const date = endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

    return date.toISOString();
  }

  private invalidateTaskCache(): void {
    this.cache.invalidate('tasks:');
    this.cache.invalidate('statistics:');
  }
}
