import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

// import { UserForAuth } from 'src/app/types/user';
import { CheckoutOrder, DBOrder } from 'src/app/types/order';
import { ClientSecret } from 'src/app/types/embeddedCheckout';

import { TradedItem } from 'src/app/types/item';
import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';

// const BASE_URL = 'http://localhost:3030/data/order';
// const CHECKOUT_SESSSION_URL = 'http://localhost:3000/checkout';
// const CHECKOUT_SESSSION_URL = 'http://localhost:5001/ecommerce-app-angularv16-v2/europe-west1/stripeEmbeddedCheckout/checkout';
const CHECKOUT_SESSSION_URL = 'https://stripeembeddedcheckout-n42dg4tbiq-ew.a.run.app/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private http: HttpClient,
    private orderStateMgmnt: OrderStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService
  ) { }

  getDBOrder(): DBOrder | null {
    return this.orderStateMgmnt.getDBOrder();
  }

  getDBTradedItems(): TradedItem[] {
    return this.tradedItmsStateMgmnt.getDBTradedItems();
  }

  createCheckoutSession(dbOrder: DBOrder, purchasedItems: TradedItem[]): Observable<ClientSecret> {
    const checkoutOrder: CheckoutOrder = { ...dbOrder, purchasedItems: [...purchasedItems] };
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = { ...checkoutOrder };
    // console.log(body);
    return this.http.post<ClientSecret>(CHECKOUT_SESSSION_URL, body, { headers });
  }
}
