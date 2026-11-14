import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.model';
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/products';
  list(): Observable<Product[]> { return this.http.get<Product[]>(this.url); }
  get(id: number): Observable<Product> { return this.http.get<Product>(`${this.url}/${id}`); }
  create(p: Product): Observable<Product> { return this.http.post<Product>(this.url, p); }
  update(id: number, p: Product): Observable<Product> { return this.http.put<Product>(`${this.url}/${id}`, p); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
