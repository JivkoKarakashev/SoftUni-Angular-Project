import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Boot, Slippers, Trainers } from 'src/app/types/item';

import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';

const BASE_URL = `${environment.apiDBUrl}/data`;
const TRAINERS_URL = `${BASE_URL}/trainers`;
const BOOTS_URL = `${BASE_URL}/boots`;
const SLIPPERS_URL = `${BASE_URL}/slippers`;

@Injectable({
  providedIn: 'root'
})
export class ShoesService {

  constructor(private http: HttpClient) { }

  getShoes() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Trainers[]>(TRAINERS_URL, { headers }),
      this.http.get<Boot[]>(BOOTS_URL, { headers }),
      this.http.get<Slippers[]>(SLIPPERS_URL, { headers })
    ]);
  }
}
