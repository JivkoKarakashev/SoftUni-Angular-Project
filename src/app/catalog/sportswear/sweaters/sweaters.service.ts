import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Sweater } from 'src/app/types/sweater';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/sweaters`;

@Injectable({
  providedIn: 'root'
})
export class SweatersService {
  sweaters: Sweater[] = [];

  constructor(private http: HttpClient) { }

  getSweaters() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Sweater[]>(URL, { headers });
  }
}
