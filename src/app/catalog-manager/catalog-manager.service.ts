import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.development';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { Observable } from 'rxjs';

const BASE_URL = `${environment.apiDBUrl}/data`;

export interface OnDeleteItemServerResponse {
  _deletedOn: number
}

@Injectable({
  providedIn: 'root'
})
export class CatalogManagerService {

  constructor(
    private http: HttpClient
  ) { }

  deleteItem(subCat: string, itemId: string): Observable<OnDeleteItemServerResponse> {
    const targetUrl: string = `${BASE_URL}/${subCat}/${itemId}`;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return this.http.delete<OnDeleteItemServerResponse>(targetUrl, { headers });
  }
}
