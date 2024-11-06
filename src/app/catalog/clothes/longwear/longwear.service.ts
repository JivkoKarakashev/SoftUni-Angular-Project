import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Longwear } from 'src/app/types/longwear';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/longwear`;

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
