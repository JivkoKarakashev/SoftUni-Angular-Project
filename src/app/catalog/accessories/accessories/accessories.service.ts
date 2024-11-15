import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Belt, Cap, Glove, Hat, Sunglasses, Watch } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const BASE_URL = `${environment.apiDBUrl}/data`;
const CAPS_HATS_URL = `${BASE_URL}/caps_hats`;
const BELTS_URL = `${BASE_URL}/belts`;
const GLOVES_URL = `${BASE_URL}/gloves`;
const SUNGLASSES_URL = `${BASE_URL}/sunglasses`;
const WATCHES_URL = `${BASE_URL}/watches`;

@Injectable({
  providedIn: 'root'
})
export class AccessoriesService {

  constructor(private http: HttpClient) { }

  getAccessories() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<(Cap | Hat)[]>(CAPS_HATS_URL, { headers }),
      this.http.get<Belt[]>(BELTS_URL, { headers }),
      this.http.get<Glove[]>(GLOVES_URL, { headers }),
      this.http.get<Sunglasses[]>(SUNGLASSES_URL, { headers }),
      this.http.get<Watch[]>(WATCHES_URL, { headers })
    ]);
  }
}
