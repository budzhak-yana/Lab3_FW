import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, delay, of, throwError } from 'rxjs';
import { Product } from './product.model';
import { initialProducts } from './products.data';

// Проста імітація REST API без стороннього сервера; дані змінюються в межах сесії.
let records: Product[] = initialProducts.map(p => ({ ...p }));
let nextId = 7;

export const mockProductsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/products')) return next(req);
  const part = req.url.slice('/api/products'.length).replace(/^\//, '');
  const id = part ? Number(part) : null;
  if (part && (!Number.isInteger(id) || id! <= 0)) {
    return throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad ID', url: req.url }));
  }
  const index = id === null ? -1 : records.findIndex(p => p.id === id);
  const notFound = () => throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }));
  const ok = (body: unknown, status = 200) => of(new HttpResponse({ status, body, url: req.url })).pipe(delay(80));
  if (req.method === 'GET' && id === null) return ok(records.map(p => ({ ...p })));
  if (req.method === 'GET') return index >= 0 ? ok({ ...records[index] }) : notFound();
  if (req.method === 'POST' && id === null) {
    const created = { ...(req.body as Product), id: nextId++ };
    records = [...records, created];
    return ok({ ...created }, 201);
  }
  if (req.method === 'PUT' && id !== null) {
    if (index < 0) return notFound();
    const updated = { ...(req.body as Product), id: id! };
    records = records.map(p => p.id === id ? updated : p);
    return ok({ ...updated });
  }
  if (req.method === 'DELETE' && id !== null) {
    if (index < 0) return notFound();
    records = records.filter(p => p.id !== id);
    return ok(null);
  }
  return throwError(() => new HttpErrorResponse({ status: 405, statusText: 'Method Not Allowed', url: req.url }));
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[HTTP]', req.method, req.url);
  return next(req).pipe(catchError(error => {
    console.error('[HTTP error]', req.url, error);
    return throwError(() => error);
  }));
};
