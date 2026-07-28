import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { PerformanceMonitoringService } from '../services/performance-monitoring.service';

@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {
  constructor(private readonly performanceMonitoring: PerformanceMonitoringService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startedAt = performance.now();

    return next.handle(request).pipe(
      finalize(() => {
        this.performanceMonitoring.record(
          `api:${request.method}:${request.url}`,
          performance.now() - startedAt
        );
      })
    );
  }
}
