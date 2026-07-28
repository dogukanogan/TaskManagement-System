import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskItem, CreateTaskRequest, UpdateTaskRequest, TaskFilter, PagedResult } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/Task`;

  constructor(private http: HttpClient) {}

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

    return this.http.get<PagedResult<TaskItem>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, data);
  }

  update(id: string, data: UpdateTaskRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toLocalDayBoundary(dateValue: string, endOfDay: boolean): string {
    const [year, month, day] = dateValue.split('-').map(Number);
    const date = endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

    return date.toISOString();
  }
}
