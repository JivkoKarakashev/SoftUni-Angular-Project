import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Waistcoat } from 'src/app/types/waistcoat';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/waistcoats';

@Injectable({
  providedIn: 'root'
})
export class WaistcoatsService {
  waistcoats: Waistcoat[] = [];

  constructor(private http: HttpClient) { }

  getWaistcoats() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Waistcoat[]>(URL, { headers });
  }
}
