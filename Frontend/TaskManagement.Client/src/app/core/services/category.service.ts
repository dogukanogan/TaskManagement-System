import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryRequest } from '../models/category.model';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/Category`;

  constructor(private http: HttpClient, private cache: ApiCacheService) {}

  getAll(): Observable<Category[]> {
    return this.cache.getOrSet('categories:all', () => this.http.get<Category[]>(this.apiUrl), 60_000);
  }

  getById(id: string): Observable<Category> {
    return this.cache.getOrSet(`categories:${id}`, () => this.http.get<Category>(`${this.apiUrl}/${id}`), 60_000);
  }

  create(data: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data).pipe(tap(() => this.invalidateRelatedCache()));
  }

  update(id: string, data: CreateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, data).pipe(tap(() => this.invalidateRelatedCache()));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateRelatedCache()));
  }

  private invalidateRelatedCache(): void {
    this.cache.invalidate('categories:');
    this.cache.invalidate('tasks:');
    this.cache.invalidate('statistics:');
  }
}
