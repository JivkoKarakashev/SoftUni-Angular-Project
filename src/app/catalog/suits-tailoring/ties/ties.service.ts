import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Tie } from 'src/app/types/tie';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/ties';

@Injectable({
  providedIn: 'root'
})
export class TiesService {
  ties: Tie[] = [];

  constructor(private http: HttpClient) { }

  getTies() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Tie[]>(URL, { headers });
  }
}
