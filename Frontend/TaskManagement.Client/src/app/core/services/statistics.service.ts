import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskStats {
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/Statistics`;

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<TaskStats> {
    return this.http.get<TaskStats>(this.apiUrl);
  }
}
