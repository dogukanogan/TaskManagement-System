import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskComment, CreateCommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  private readonly apiUrl = `${environment.apiUrl}/task`;

  constructor(private http: HttpClient) {}

  getAll(taskId: string): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${this.apiUrl}/${taskId}/comments`);
  }

  add(taskId: string, data: CreateCommentRequest): Observable<TaskComment> {
    return this.http.post<TaskComment>(`${this.apiUrl}/${taskId}/comments`, data);
  }

  delete(taskId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}/comments/${commentId}`);
  }
}