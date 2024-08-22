import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SwimSurf } from 'src/app/types/swimSurf';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/swim_surf';

@Injectable({
  providedIn: 'root'
})
export class SwimSurfService {
  swimSurf: SwimSurf[] = [];

  constructor(private http: HttpClient) { }

  getSwimSurf() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<SwimSurf[]>(URL, { headers });
  }
}
