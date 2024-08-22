import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BlazerJacket } from 'src/app/types/blazerJacket';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/blazers_jackets';

@Injectable({
  providedIn: 'root'
})
export class BlazersJacketsService {
  blazersJackets: BlazerJacket[] = [];

  constructor(private http: HttpClient) { }

  getBlazersJackets() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<BlazerJacket[]>(URL, { headers });
  }
}
