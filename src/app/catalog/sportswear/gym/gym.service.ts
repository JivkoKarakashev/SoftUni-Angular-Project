import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Gym } from 'src/app/types/gym';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/gym';

@Injectable({
  providedIn: 'root'
})
export class GymService {
  gym: Gym[] = [];

  constructor(private http: HttpClient) { }

  getGym() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Gym[]>(URL, { headers });
  }
}
