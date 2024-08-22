import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Watch } from 'src/app/types/watch';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/watches';

@Injectable({
  providedIn: 'root'
})
export class WatchesService {
  watches: Watch[] = [];

  constructor(private http: HttpClient) { }

  getWatches() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Watch[]>(URL, { headers });
  }
}
