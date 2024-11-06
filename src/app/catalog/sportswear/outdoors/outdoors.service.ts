import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Outdoors } from 'src/app/types/outdoors';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/outdoors`;

@Injectable({
  providedIn: 'root'
})
export class OutdoorsService {
  outdoors: Outdoors[] = [];

  constructor(private http: HttpClient) { }

  getOutdoors() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Outdoors[]>(URL, { headers });
  }
}
