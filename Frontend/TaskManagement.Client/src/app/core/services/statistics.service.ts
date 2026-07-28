import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardPeriod, TaskStatistics } from '../models/statistics.model';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly apiUrl = `${environment.apiUrl}/Statistics`;

  constructor(private http: HttpClient, private cache: ApiCacheService) {}

  get(period: DashboardPeriod = 'all'): Observable<TaskStatistics> {
    return this.cache.getOrSet(
      `statistics:summary:${period}`,
      () => this.http.get<TaskStatistics>(this.apiUrl, { params: { period } }).pipe(
        map(response => ({
          ...response,
          upcomingTasks: response.upcomingTasks ?? [],
          overdueTasks: response.overdueTasks ?? [],
          recentTasks: response.recentTasks ?? [],
          trend: response.trend ?? [],
          period: response.period ?? period
        }))
      ),
      30_000
    );
  }
}
