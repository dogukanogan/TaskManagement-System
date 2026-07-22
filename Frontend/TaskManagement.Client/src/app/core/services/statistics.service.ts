import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskStatistics } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly apiUrl = `${environment.apiUrl}/Statistics`;

  constructor(private http: HttpClient) {}

  get(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(this.apiUrl);
  }
}