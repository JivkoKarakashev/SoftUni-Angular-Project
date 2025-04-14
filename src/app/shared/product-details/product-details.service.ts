import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

import { Item } from 'src/app/types/item';
import { environment } from 'src/environments/environment.development';
import { CustomError } from '../errors/custom-error';

const BASE_URL = `${environment.apiDBUrl}/data`;

@Injectable({
  providedIn: 'root'
})
export class ProductDetailsService {
  private productDetails$$ = new BehaviorSubject<Item | null>(null);

  constructor(private http: HttpClient) { }

  getProductDetails(): Item | CustomError {
    const details = this.productDetails$$.value;
    if (details) {
      return details;
    }
    return this.customError();
  }
  setProductDetails(item: Item): void {
    this.productDetails$$.next({ ...item });
  }
  resetProductDetails(): void {
    this.productDetails$$.next(null);
  }

  fetchProductDetailsByUrl(url: string): Observable<Item> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Item>(`${BASE_URL}/${url}`, { headers });
  }

  private customError(): CustomError {
    const name = 'Item Error';
    const message = 'Item is null!';
    const isUserError = false;
    return new CustomError(name, message, isUserError);
  }
}
