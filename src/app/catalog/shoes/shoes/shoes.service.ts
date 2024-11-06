import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { environment } from 'src/environments/environment.development';

const BASE_URL = `${environment.apiDBUrl}/data`;
const TRAINERS_URL = `${BASE_URL}/trainers`;
const BOOTS_URL = `${BASE_URL}/boots`;
const SLIPPERS_URL = `${BASE_URL}/slippers`;

@Injectable({
  providedIn: 'root'
})
export class ShoesService {
  trainers: Trainers[] = [];
  boots: Boot[] = [];
  slippers: Slippers[] = [];
  shoes: (Trainers | Boot | Slippers)[] = [];

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
