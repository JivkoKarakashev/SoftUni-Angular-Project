import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.development';
import { Partywear, Tuxedo } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = `${environment.apiDBUrl}/data/tuxedos_partywear`;

@Injectable({
  providedIn: 'root'
})
export class TuxedosPartywearService {

  constructor(private http: HttpClient) { }

  getTuxedosPartywear() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<(Tuxedo | Partywear)[]>(URL, { headers });
  }
}
