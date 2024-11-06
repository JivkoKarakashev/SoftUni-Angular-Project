import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Jacket } from 'src/app/types/jacket';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/jackets`;

@Injectable({
  providedIn: 'root'
})
export class JacketsService {
  jackets: Jacket[] = [];

  constructor(private http: HttpClient) { }

  getJackets() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Jacket[]>(URL, { headers });
  }
}
