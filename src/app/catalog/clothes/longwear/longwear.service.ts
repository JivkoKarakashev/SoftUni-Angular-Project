import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Longwear } from 'src/app/types/longwear';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/longwear';

@Injectable({
  providedIn: 'root'
})
export class LongwearService {
  longwear: Longwear[] = [];

  constructor(private http: HttpClient) { }

  getLongwear() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Longwear[]>(URL, { headers });
  }
}
