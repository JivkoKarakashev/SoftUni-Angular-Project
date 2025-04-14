import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Item } from 'src/app/types/item';
import { environment } from 'src/environments/environment.development';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { ProductDetailsService } from '../product-details/product-details.service';
import { CustomError } from '../errors/custom-error';

const BASE_URL = `${environment.apiDBUrl}/data`

@Injectable({
  providedIn: 'root'
})
export class RelatedProductsService {

  constructor(
    private http: HttpClient,
    private detailsService: ProductDetailsService
  ) { }

  getCollectionSize(): Observable<number | CustomError> {
    const product = this.detailsService.getProductDetails();
    if (product instanceof CustomError) {
      const error = product;
      return of(error);
    }
    const { subCat } = product;
    const url = `${BASE_URL}/${subCat}?count`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<number>(url, { headers });
    // return of(0);
  }

  getRelatedProductsByPage(skipSizeReq: number, pageSizeReq: number): Observable<Item[] | CustomError> {
    const product = this.detailsService.getProductDetails();
    if (product instanceof CustomError) {
      const error = product;
      return of(error);
    }
    const { subCat } = product;
    const url = `${BASE_URL}/${subCat}?offset=${skipSizeReq}&pageSize=${pageSizeReq}`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Item[]>(url, { headers });
  }
}
