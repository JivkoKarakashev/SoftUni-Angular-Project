import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Slippers } from 'src/app/types/slippers';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/slippers`;

@Injectable({
  providedIn: 'root'
})
export class SlippersService {
  boots: Slippers[] = [];

  constructor(private http: HttpClient) { }

  getSlippers() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Slippers[]>(URL, { headers });
  }
}
