import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskItem, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';
import { PagedResult } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/Task`;

  constructor(private http: HttpClient) { }

  getTasks(status?: number, priority?: number, categoryId?: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<TaskItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined && status !== null) params = params.set('status', status.toString());
    if (priority !== undefined && priority !== null) params = params.set('priority', priority.toString());
    if (categoryId) params = params.set('categoryId', categoryId);

    return this.http.get<PagedResult<TaskItem>>(this.apiUrl, { params });
  }

  getOverdueTasks(): Observable<PagedResult<TaskItem>> {
    return this.http.get<PagedResult<TaskItem>>(`${this.apiUrl}/overdue`);
  }

  getTaskById(id: string): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  createTask(request: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, request);
  }

  updateTask(id: string, request: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
