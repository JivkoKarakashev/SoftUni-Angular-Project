import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CapHat } from 'src/app/types/capHat';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/caps_hats';

@Injectable({
  providedIn: 'root'
})
export class CapsHatsService {
  capsHats: CapHat[] = [];

  constructor(private http: HttpClient) { }

  getCapsHats() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<CapHat[]>(URL, { headers });
  }
}
