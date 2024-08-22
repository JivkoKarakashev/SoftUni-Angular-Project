import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Boot } from 'src/app/types/boot';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/boots';

@Injectable({
  providedIn: 'root'
})
export class BootsService {
  boots: Boot[] = [];

  constructor(private http: HttpClient) { }

  getBoots() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Boot[]>(URL, { headers });
  }
}
