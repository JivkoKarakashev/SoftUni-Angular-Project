import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CapHat } from 'src/app/types/capHat';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/caps_hats`;

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
