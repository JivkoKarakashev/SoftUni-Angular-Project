import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Item } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { PaginationSubcategoryConfig } from 'src/app/shared/utils/pagination-category.service';

const BASE_URL = `${environment.apiDBUrl}/data`;
const GYM_URL = `${BASE_URL}/gym`;
const RUNNING_URL = `${BASE_URL}/running`;
const SKI_SNOWBOARD_URL = `${BASE_URL}/ski_snowboard`;
const SWIM_SURF_URL = `${BASE_URL}/swim_surf`;
const OUTDOORS_URL = `${BASE_URL}/outdoors`;
const BOTTOMS_LEGGINGS_URL = `${BASE_URL}/bottoms_leggings`;
const SWEATERS_URL = `${BASE_URL}/sweaters`;

@Injectable({
  providedIn: 'root'
})
export class SportswearService {
  private categoryUrls: Array<string> = [
    GYM_URL,
    RUNNING_URL,
    SKI_SNOWBOARD_URL,
    SWIM_SURF_URL,
    OUTDOORS_URL,
    BOTTOMS_LEGGINGS_URL,
    SWEATERS_URL
  ];

  getCategoryUrls() {
    return this.categoryUrls;
  }

  constructor(private http: HttpClient) { }

  getCollectionComposition(): Observable<number[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const reqArr: Array<Observable<number>> = [];
    this.categoryUrls.forEach(url => reqArr.push(this.http.get<number>(`${url}?count`, { headers })));
    return forkJoin([...reqArr]);
    // return of([0]);
  }

  getSportswearByPage(subcatConfigs: PaginationSubcategoryConfig[]) {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const reqArr: Array<Observable<Item[]>> = [];
    for (let i = 0; i < subcatConfigs.length; i++) {
      const { subcategorySize, subcategoryUrl, subcategorySkipReq, subcategorySizeReq } = subcatConfigs[i];
      if (subcategorySkipReq >= subcategorySize) {
        continue;
      }
      reqArr.push(this.http.get<Item[]>(`${subcategoryUrl}?offset=${subcategorySkipReq}&pageSize=${subcategorySizeReq}`, { headers }));
    }
    return forkJoin([...reqArr]);
  }
}
