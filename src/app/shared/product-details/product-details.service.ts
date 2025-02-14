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

  fetchProductDetails(): Observable<Item> {
    if (this.productDetails$$.value) {
      const { subCat, _id } = this.productDetails$$.value;
      const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
      return this.http.get<Item>(`${BASE_URL}/${subCat}/${_id}`, { headers });
    }
    return EMPTY;
  }
}
