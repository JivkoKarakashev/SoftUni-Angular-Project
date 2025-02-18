import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

import { Item } from 'src/app/types/item';
import { environment } from 'src/environments/environment.development';

const BASE_URL = `${environment.apiDBUrl}/data`;

@Injectable({
  providedIn: 'root'
})
export class ProductDetailsService {
  private productDetails$$ = new BehaviorSubject<Item | null>(null);

  constructor(private http: HttpClient) { }

  getProductDetails(): Item | null {
    return this.productDetails$$.value;
  }
  setProductDetails(item: Item): void {
    this.productDetails$$.next({ ...item });
  }
  resetProductDetails(): void {
    this.productDetails$$.next(null);
  }

  fetchProductDetails(url?: string, id?: string): Observable<Item> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    if (url && id) {
      return this.http.get<Item>(`${BASE_URL}/${url}/${id}`, { headers });
    }
    else if (this.productDetails$$.value) {
      const { subCat, _id } = this.productDetails$$.value;
      return this.http.get<Item>(`${BASE_URL}/${subCat}/${_id}`, { headers });
    }
    return EMPTY;
  }
}
