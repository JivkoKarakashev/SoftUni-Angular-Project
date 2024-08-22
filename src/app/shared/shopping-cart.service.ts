import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, filter, forkJoin, Observable } from 'rxjs';

import { Shipping } from '../types/shipping';
import { Discount } from '../types/discount';
import { CartItem } from '../types/cartItem';
import { CheckForItemType } from './utils/checkForItemType';
import { Order } from '../types/order';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';

const SHIPPINGMETHODS_URL = 'http://localhost:3030/data/shipping';
const DISCOUNTS_URL = 'http://localhost:3030/data/discounts';
const ORDER_URL = 'http://localhost:3030/data/order';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private cartItems$$ = new BehaviorSubject<CartItem[]>([]);
  private cartItems$ = this.cartItems$$.asObservable();

  constructor(private http: HttpClient, private checkForItemType: CheckForItemType) { }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  getAvailablePurchaseServices() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Discount[]>(DISCOUNTS_URL, { headers }),
      this.http.get<Shipping[]>(SHIPPINGMETHODS_URL, { headers })
    ]);
  }

  addCartItem(item: CartItem) {
    if (this.checkForItemType.isItem(item)) {
      throw new Error('Wrong cartItem type!');
    }
    this.cartItems$$.next([...this.cartItems$$.value, item]);
    // console.log(this.cartItems$$.value);
  }

  removeCartItems(idxArr: number[]) {
    // console.log(idxArr);
    const newItemsArr = [...this.cartItems$$.value];
    for (let i = idxArr.length - 1; i >= 0; i--) {
      newItemsArr.splice(idxArr[i], 1);
    }
    // console.log(newItemsArr);
    this.cartItems$$.next(newItemsArr);
    // console.log(this.items$$.value);
  }

  removeCartItm(idx: number) {
    const newItemsArr = [...this.cartItems$$.value];
    newItemsArr.splice(idx, 1);
    this.cartItems$$.next((newItemsArr));
    // console.log(this.items$$.value);
  }

  emptyCart(): void {
    this.cartItems$$.next([]);
  }

  placeOrder(
    purchasedItems: CartItem[],
    subtotal: number,
    discount: Discount,
    discountValue: number,
    shippingMethod: Shipping,
    shippingValue: number,
    total: number): Observable<Order> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total });
    // console.log(purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total);
    return this.http.post<Order>(ORDER_URL, body, { headers });
  }
}
