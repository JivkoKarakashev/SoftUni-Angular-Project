import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Item } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { SubcategoryPaginationConfig } from 'src/app/shared/utils/category-pagination.service';

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
  private categoryUrls: Array<string> = [
    CAPS_HATS_URL,
    BELTS_URL,
    GLOVES_URL,
    SUNGLASSES_URL,
    WATCHES_URL
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

  getAccessoriesByPage(subcatConfigs:SubcategoryPaginationConfig[]) {
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
