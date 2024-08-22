import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Sunglasses } from 'src/app/types/sunglasses';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/sunglasses';

@Injectable({
  providedIn: 'root'
})
export class SunglassesService {
  sunglasses: Sunglasses[] = [];

  constructor(private http: HttpClient) { }

  getSunglasses() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Sunglasses[]>(URL, { headers });
  }
}
