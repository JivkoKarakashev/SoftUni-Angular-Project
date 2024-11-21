import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment.development';

import { DBOrder } from '../types/order';
import { TradedItem } from '../types/item';

import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';
import { BuildTradedItemsRequestsArrayService } from '../shared/utils/build-traded-items-requests-array.service';

const BASE_URL = `${environment.apiDBUrl}/data`;
const ORDERS_URL = `${BASE_URL}/orders`;
// const ORDERS_URL = `${BASE_URL}/order`;
const TRADES_URL = `${BASE_URL}/traded_items`;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private http: HttpClient,
    private buildTradesReqsArr: BuildTradedItemsRequestsArrayService
    ) { }

  getAlldbOrdersByUserId(userId: string): Observable<DBOrder[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return this.http.get<DBOrder[]>(`${ORDERS_URL}?where=_ownerId%3D%22${userId}%22`, { headers });
  }

  getAllPurchasesByUserOrders(dbOrdersArr: DBOrder[]): Observable<Array<TradedItem[]>> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    // return this.http.get<TradedItem[]>(`${TRADES_URL}?where=orderId%3D%22${orderId}%22`, { headers });
    return forkJoin([...this.buildTradesReqsArr.buildGetReqs(dbOrdersArr, headers)]);
  }

  getAllSalesByUserId(userId: string): Observable<TradedItem[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return this.http.get<TradedItem[]>(`${TRADES_URL}?where=sellerId%3D%22${userId}%22`, { headers });
  }

  getProfileDataByUserId(userId: string): Observable<[DBOrder[], TradedItem[] | []]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<DBOrder[]>(`${ORDERS_URL}?where=_ownerId%3D%22${userId}%22`, { headers }).pipe(catchError(err => { throw err; })),
      this.http.get<TradedItem[] | []>(`${TRADES_URL}?where=sellerId%3D%22${userId}%22`, { headers }).pipe(catchError(err => { throw err; }))
    ]);
  }
}
