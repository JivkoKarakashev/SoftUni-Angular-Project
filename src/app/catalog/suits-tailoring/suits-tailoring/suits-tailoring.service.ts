import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Blazer, Jacket, Partywear, Tie, Tuxedo, Waistcoat, Workwear } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const BASE_URL = `${environment.apiDBUrl}/data`;
const BLAZERS_JACKETS_URL = `${BASE_URL}/blazers_jackets`;
const WAISTCOATS_URL = `${BASE_URL}/waistcoats`;
const TUXEDOS_PARTYWEAR_URL = `${BASE_URL}/tuxedos_partywear`;
const TIES_URL = `${BASE_URL}/ties`;
const WORKWEAR_URL = `${BASE_URL}/workwear`;

@Injectable({
  providedIn: 'root'
})
export class SuitsTailoringService {

  constructor(private http: HttpClient) { }

  getSuitsTailoring() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<(Blazer | Jacket)[]>(BLAZERS_JACKETS_URL, { headers }),
      this.http.get<Waistcoat[]>(WAISTCOATS_URL, { headers }),
      this.http.get<(Tuxedo | Partywear)[]>(TUXEDOS_PARTYWEAR_URL, { headers }),
      this.http.get<Tie[]>(TIES_URL, { headers }),
      this.http.get<Workwear[]>(WORKWEAR_URL, { headers })
    ]);
  }
}
