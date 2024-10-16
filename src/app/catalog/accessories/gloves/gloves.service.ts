import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Glove } from 'src/app/types/glove';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/gloves';

@Injectable({
  providedIn: 'root'
})
export class GlovesService {
  gloves: Glove[] = [];

  constructor(private http: HttpClient) { }

  getGloves() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Glove[]>(URL, { headers });
  }
}
