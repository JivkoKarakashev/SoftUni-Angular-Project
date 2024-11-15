import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

import { TradedItem } from 'src/app/types/item';

import { DBOrder } from 'src/app/types/order';
import { SessionStatus } from 'src/app/types/sessionStatus';
import { environment } from 'src/environments/environment.development';

// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:3000/checkout/session-status';
// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:5001/ecommerce-app-angularv16-v2/europe-west1/stripeEmbeddedCheckout/checkout/session-status';
const CHECKOUT_SESSSION_STATUS_URL = environment.apiCheckoutUrl;
const BASE_URL = `${environment.apiDBUrl}/data`;
const ORDER_URL = `${BASE_URL}/order`;
const TRADES_URL = `${BASE_URL}/traded_items`;

@Injectable({
  providedIn: 'root'
})
export class ConfirmOrderService {
  
  constructor(private http: HttpClient, ) { }

  getSessionStatus(sessionId: string): Observable<SessionStatus> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<SessionStatus>(`${CHECKOUT_SESSSION_STATUS_URL}?session_id=${sessionId}`, { headers });
  }

  updateDBOrderById(dbOrder: DBOrder, orderId: string): Observable<DBOrder> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ ...dbOrder });
    return this.http.put<DBOrder>(`${ORDER_URL}/${orderId}`, body, { headers });
  }

  getTradedItemsByOrderId(orderId: string): Observable<TradedItem[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return this.http.get<TradedItem[]>(`${TRADES_URL}/?where=orderId%3D%22${orderId}%22`, { headers });
  }

}
