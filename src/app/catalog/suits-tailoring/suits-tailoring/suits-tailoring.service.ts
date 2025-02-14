import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Item } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { SubcategoryPaginationConfig } from 'src/app/shared/utils/category-pagination.service';

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
  private categoryUrls: Array<string> = [
    BLAZERS_JACKETS_URL,
    WAISTCOATS_URL,
    TUXEDOS_PARTYWEAR_URL,
    TIES_URL,
    WORKWEAR_URL
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

  getSuitsTailoringByPage(subcatConfigs: SubcategoryPaginationConfig[]) {
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
