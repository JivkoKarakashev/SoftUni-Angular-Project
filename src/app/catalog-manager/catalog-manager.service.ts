import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { CreateItem, Item } from '../types/item';

const BASE_URL = `${environment.apiDBUrl}/data`;

export interface OnDeleteItemServerResponse {
  _deletedOn: number
}

@Injectable({
  providedIn: 'root'
})
export class CatalogManagerService {

  private catalogItemToEdit$$ = new BehaviorSubject<Item | null>(null);

  constructor(
    private http: HttpClient
  ) { }

  getCatalogItemToEdit(): Item | null {
    return this.catalogItemToEdit$$.value;
  }
  setCatalogItemToEdit(item: Item): void {
    this.catalogItemToEdit$$.next({ ...item });
  }
  resetCatalogItemToEdit(): void {
    this.catalogItemToEdit$$.next(null);
  }

  deleteItem(subCat: string, itemId: string): Observable<OnDeleteItemServerResponse> {
    const targetUrl: string = `${BASE_URL}/${subCat}/${itemId}`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return this.http.delete<OnDeleteItemServerResponse>(targetUrl, { headers });
  }

  createItem(item: CreateItem): Observable<Item> {
    const { subCat } = item;
    const targetUrl: string = `${BASE_URL}/${subCat}`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ ...item });
    return this.http.post<Item>(targetUrl, body, { headers });
  }

  editItem(item: Item): Observable<Item> {
    const { _id, subCat } = item;
    const targetUrl: string = `${BASE_URL}/${subCat}/${_id}`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ ...item });
    return this.http.put<Item>(targetUrl, body, { headers });
  }
}
