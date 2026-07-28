import { Injectable } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';

interface CacheEntry<T> {
  expiresAt: number;
  value$: Observable<T>;
}

@Injectable({ providedIn: 'root' })
export class ApiCacheService {
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries = 100;

  getOrSet<T>(key: string, factory: () => Observable<T>, ttlMs: number): Observable<T> {
    const cached = this.entries.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) return cached.value$;

    if (cached) this.entries.delete(key);
    this.removeExpiredEntries();

    if (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey) this.entries.delete(oldestKey);
    }

    const value$ = factory().pipe(
      catchError(error => {
        this.entries.delete(key);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.entries.set(key, { expiresAt: Date.now() + ttlMs, value$ });
    return value$;
  }

  invalidate(prefix: string): void {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  clear(): void {
    this.entries.clear();
  }

  private removeExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}
