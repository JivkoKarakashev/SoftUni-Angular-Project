import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Belt } from 'src/app/types/belt';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/belts';

@Injectable({
  providedIn: 'root'
})
export class BeltsService {
  capsHats: Belt[] = [];

  constructor(private http: HttpClient) { }

  getBelts() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Belt[]>(URL, { headers });
  }
}
