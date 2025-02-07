import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Cap, Hat } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = `${environment.apiDBUrl}/data/caps_hats`;

@Injectable({
  providedIn: 'root'
})
export class CapsHatsService {

  constructor(private http: HttpClient) { }

  getCollectionSize(): Observable<number> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<number>(`${URL}?count`, { headers });
    // return of(0);
  }

  getCapsHatsByPage(skipSizeReq: number, pageSizeReq: number) {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<(Cap | Hat)[]>(`${URL}?offset=${skipSizeReq}&pageSize=${pageSizeReq}`, { headers });
  }
}
