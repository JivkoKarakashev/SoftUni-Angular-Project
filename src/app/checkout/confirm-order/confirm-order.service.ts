import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { CheckForItemTypeService } from 'src/app/shared/utils/check-for-item-type.service';
import { DBOrder, dbOrderInitialState } from 'src/app/types/order';
import { SessionStatus } from 'src/app/types/sessionStatus';
import { environment } from 'src/environments/environment.development';

// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:3000/checkout/session-status';
// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:5001/ecommerce-app-angularv16-v2/europe-west1/stripeEmbeddedCheckout/checkout/session-status';
const CHECKOUT_SESSSION_STATUS_URL = environment.apiCheckoutUrl;
const BASE_URL = `${environment.apiDBUrl}/data/order`;

@Injectable({
  providedIn: 'root'
})
export class ConfirmOrderService {
  private dbOrderState$$ = new BehaviorSubject<DBOrder>({ ...dbOrderInitialState });
  private dbOrderState$ = this.dbOrderState$$.asObservable();

  constructor(private http: HttpClient, private checkType: CheckForItemTypeService) { }

  getDBOrderState(): Observable<DBOrder> {
    return this.dbOrderState$;
  }

  setDBOrderState(dbOrderState: DBOrder): void {
    if (this.checkType.isDBOrder(dbOrderState)) {
      this.dbOrderState$$.next({ ...this.dbOrderState$$.value, ...dbOrderState });
      this.preserveDBOrderState();
    } else if (this.checkType.isOrder(dbOrderState)) {
      throw new Error('Wrong Order type!');
    }
  }

  private preserveDBOrderState(): void {
    localStorage.setItem('dbOrderState', JSON.stringify({ ...this.dbOrderState$$.value }));
  }

  removeDBOrderStateFromLStor(): void {
    localStorage.removeItem('dbOrderState');
    console.log('REMOVE DATABASE ORDER STATE FROM LSTOR INVOKED!');
  }

  resetDBOrderState(): void {
    this.dbOrderState$$.next({ ...this.dbOrderState$$.value, ...dbOrderInitialState });
    this.removeDBOrderStateFromLStor();
  }

  getSessionStatus(sessionId: string): Observable<SessionStatus> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<SessionStatus>(`${CHECKOUT_SESSSION_STATUS_URL}?session_id=${sessionId}`, { headers });
  }

  getOrederCollectionSize(): Observable<number> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<number>(`${BASE_URL}?count`, { headers });
  }

  updateDBOrderById(dbOrder: DBOrder, orderId: string): Observable<DBOrder> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ ...dbOrder });
    return this.http.put<DBOrder>(`${BASE_URL}/${orderId}`, body, { headers });
  }
}
