import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/tuxedos_partywear`;

@Injectable({
  providedIn: 'root'
})
export class TuxedosPartywearService {
  tuxedosPartywear: TuxedoPartywear[] = [];

  constructor(private http: HttpClient) { }

  getTuxedosPartywear() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<TuxedoPartywear[]>(URL, { headers });
  }
}
