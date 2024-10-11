import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
// import { UserForAuth } from 'src/app/types/user';
import { DBOrder } from 'src/app/types/order';
import { ClientSecret } from 'src/app/types/embeddedCheckout';
import { ConfirmOrderService } from '../confirm-order/confirm-order.service';

// const BASE_URL = 'http://localhost:3030/data/order';
// const CHECKOUT_SESSSION_URL = 'http://localhost:3000/checkout';
// const CHECKOUT_SESSSION_URL = 'http://localhost:5001/ecommerce-app-angularv16-v2/europe-west1/stripeEmbeddedCheckout/checkout';
const CHECKOUT_SESSSION_URL = 'https://stripeembeddedcheckout-n42dg4tbiq-ew.a.run.app/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // private user: UserForAuth | null = null;
  // private _ownerId: string | null = null;
  // private order_url = '';

  constructor(private http: HttpClient, private confirmOrderService: ConfirmOrderService) { }

  // getOrder(): Observable<Order[]> {
  //   this.user$ = JSON.parse(localStorage?.getItem('userData') as string) || null;
  //   this._ownerId = this.user$?._id as string || null;
  //   // console.log(this.user$);
  //   // console.log(this._ownerId);
  //   this.order_url = `${BASE_URL}?where=_ownerId%3D%22${this._ownerId}%22 AND paymentState IN ("unpaid")`;
  //   const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
  //   return this.http.get<Order[]>(this.order_url, { headers });
  // }
  getDBOrder(): Observable<DBOrder> {
    return this.confirmOrderService.getDBOrderState();
  }

  createCheckoutSession(dbOrder: DBOrder): Observable<ClientSecret> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = { ...dbOrder };
    return this.http.post<ClientSecret>(CHECKOUT_SESSSION_URL, body, { headers });
  }
}
