import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const BASE_URL = `${environment.apiDBUrl}/data`
const JACKETS_URL = `${BASE_URL}/jackets`;
const LONGWEAR_URL = `${BASE_URL}/longwear`;

@Injectable({
  providedIn: 'root'
})
export class ClothesService {
  jackets: Jacket[] = [];
  longwear: Longwear[] = [];
  clothes: (Jacket | Longwear)[] = [];

  constructor(private http: HttpClient) { }

  getClothes() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Jacket[]>(JACKETS_URL, { headers }),
      this.http.get<Longwear[]>(LONGWEAR_URL, { headers })
    ]);
  }
}
