import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { SessionStatus } from 'src/app/types/sessionStatus';

// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:3000/checkout/session-status';
// const CHECKOUT_SESSSION_STATUS_URL = 'http://localhost:5001/ecommerce-app-angularv16-v2/europe-west1/stripeEmbeddedCheckout/checkout/session-status';
const CHECKOUT_SESSSION_STATUS_URL = 'https://stripeembeddedcheckout-n42dg4tbiq-ew.a.run.app/checkout/session-status';

@Injectable({
  providedIn: 'root'
})
export class ConfirmOrderService {

  constructor(private http: HttpClient) { }

  getSessionStatus(sessionId: string): Observable<SessionStatus> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<SessionStatus>(`${CHECKOUT_SESSSION_STATUS_URL}?session_id=${sessionId}`, { headers });
  }
}
