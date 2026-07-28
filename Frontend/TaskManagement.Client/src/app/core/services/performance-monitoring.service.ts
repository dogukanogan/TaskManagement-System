import { Injectable, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PerformanceMetric {
  name: string;
  value: number;
  recordedAt: number;
}

@Injectable({ providedIn: 'root' })
export class PerformanceMonitoringService {
  readonly metrics = signal<PerformanceMetric[]>([]);
  private navigationStartedAt = 0;
  private initialized = false;

  constructor(private readonly router: Router) {}

  initialize(): void {
    if (this.initialized || typeof performance === 'undefined') return;
    this.initialized = true;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.navigationStartedAt = performance.now();
      if (event instanceof NavigationEnd && this.navigationStartedAt > 0) {
        this.record('route-navigation', performance.now() - this.navigationStartedAt);
      }
    });

    this.observePaintMetrics();
  }

  record(name: string, value: number): void {
    const metric = { name, value: Math.round(value * 100) / 100, recordedAt: Date.now() };
    this.metrics.update(metrics => [...metrics.slice(-49), metric]);

    if (!environment.production) {
      console.debug(`[Performance] ${metric.name}: ${metric.value}ms`);
    }
  }

  private observePaintMetrics(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) this.record(entry.name, entry.startTime);
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch {
      // Older browsers may not support buffered paint observers.
    }
  }
}
