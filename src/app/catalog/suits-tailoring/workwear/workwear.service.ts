import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.development';
import { Workwear } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { Observable } from 'rxjs';

const URL = `${environment.apiDBUrl}/data/workwear`;

@Injectable({
  providedIn: 'root'
})
export class WorkwearService {

  constructor(private http: HttpClient) { }

  getWorkwear(): Observable<Workwear[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Workwear[]>(URL, { headers });
  }
}
