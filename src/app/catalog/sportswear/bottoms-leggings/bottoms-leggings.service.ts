import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/bottoms_leggings`;

@Injectable({
  providedIn: 'root'
})
export class BottomsLeggingsService {
  bottomsLeggings: BottomsLeggings[] = [];

  constructor(private http: HttpClient) { }

  getBottomsLeggings() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<BottomsLeggings[]>(URL, { headers });
  }
}
