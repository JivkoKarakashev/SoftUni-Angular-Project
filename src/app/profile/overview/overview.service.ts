import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const BASE_URL = `${environment.apiDBUrl}/data`;
const ORDERS_URL = `${BASE_URL}/orders`;
// const ORDERS_URL = `${BASE_URL}/order`;
const SALES_URL = `${BASE_URL}/traded_items`;

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor(private http: HttpClient) { }

  getOverviewDataByUserId(userId: string): Observable<number[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      /*<--------------------------------Published Items By SubCategory-------------------------------->*/
      this.http.get<number>(`${BASE_URL}/jackets?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/longwear?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/trainers?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/boots?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/slippers?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/caps_hats?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/belts?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/gloves?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/sunglasses?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/watches?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/gym?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/running?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/ski_snowboard?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/swim_surf?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/outdoors?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/bottoms_leggings?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/sweaters?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/blazers_jackets?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/waistcoats?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/tuxedos_partywear?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      this.http.get<number>(`${BASE_URL}/ties?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      /*<--------------------------------Orders-------------------------------->*/
      this.http.get<number>(`${BASE_URL}/orders?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      /*<--------------------------------Purchased Items-------------------------------->*/
      this.http.get<number>(`${BASE_URL}/traded_items?where=_ownerId%3D%22${userId}%22&count`, { headers }),
      /*<--------------------------------Sold Items-------------------------------->*/
      this.http.get<number>(`${BASE_URL}/traded_items?where=sellerId%3D%22${userId}%22&count`, { headers })
    ]);
  }
}
