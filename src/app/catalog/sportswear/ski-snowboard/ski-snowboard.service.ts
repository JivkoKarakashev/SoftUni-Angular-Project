import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/ski_snowboard';

@Injectable({
  providedIn: 'root'
})
export class SkiSnowboardService {
  skiSnowboard: SkiSnowboard[] = [];

  constructor(private http: HttpClient) { }

  getSkiSnowboard() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<SkiSnowboard[]>(URL, { headers });
  }
}
