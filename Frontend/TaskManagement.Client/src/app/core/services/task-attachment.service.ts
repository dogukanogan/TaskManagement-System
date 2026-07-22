import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskAttachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class TaskAttachmentService {
  private readonly apiUrl = `${environment.apiUrl}/task`;

  constructor(private http: HttpClient) {}

  getAll(taskId: string): Observable<TaskAttachment[]> {
    return this.http.get<TaskAttachment[]>(`${this.apiUrl}/${taskId}/attachments`);
  }

  upload(taskId: string, file: File): Observable<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<TaskAttachment>(`${this.apiUrl}/${taskId}/attachments`, formData);
  }

  download(taskId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  delete(taskId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}/attachments/${attachmentId}`);
  }
}