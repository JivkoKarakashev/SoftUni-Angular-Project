import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { Shipping } from '../../types/shipping';
import { Discount } from '../../types/discount';
import { CartItem, Item, TradedItem } from 'src/app/types/item';
import { DBOrder, Order } from '../../types/order';

import { HttpLogoutInterceptorSkipHeader } from '../../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../../interceptors/http-ajax.interceptor';

import { CheckForItemTypeService } from '../utils/check-for-item-type.service';
import { BuildUpdateRequestsArrayService } from '../utils/build-update-requests-array.service';
import { BuildTradedItemsRequestsArrayService } from '../utils/build-traded-items-requests-array.service';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';

const BASE_URL = `${environment.apiDBUrl}/data`;
const SHIPPINGMETHODS_URL = `${BASE_URL}/shipping`;
const DISCOUNTS_URL = `${BASE_URL}/discounts`;
const ORDER_URL = `${BASE_URL}/order`;

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(
    private http: HttpClient,
    private checkForItemType: CheckForItemTypeService,
    private buildUpdReqsArr: BuildUpdateRequestsArrayService,
    private buildTradesReqsArr: BuildTradedItemsRequestsArrayService,
    private cartStateMgmnt: ShoppingCartStateManagementService
  ) { }

  getAvailablePurchaseServices(): Observable<[Discount[], Shipping[]]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Discount[]>(DISCOUNTS_URL, { headers }),
      this.http.get<Shipping[]>(SHIPPINGMETHODS_URL, { headers })
    ]);
  }

  addCartItem(item: CartItem): void {
    if (!this.checkForItemType.isCartItem(item)) {
      throw new Error('Wrong cartItem type!');
    }
    this.cartStateMgmnt.updateCartItemsState(item);
    this.cartStateMgmnt.preserveCartState.preserveCartItemsState();
    // this.cartItems$$.next([...this.cartItems$$.value, item]);
    // this.preserveCartState.preserveCartItemsState();
    // console.log(this.cartItems$$.value);
  }

  removeCartItems(idxArr: number[]): void {
    // console.log(idxArr);
    const newItemsArr = [...this.cartStateMgmnt.getCartItems()];
    // const newItemsArr = [...this.cartItems$$.value];
    for (let i = idxArr.length - 1; i >= 0; i--) {
      newItemsArr.splice(idxArr[i], 1);
    }
    // console.log(newItemsArr);
    this.cartStateMgmnt.setCartItemsState(newItemsArr);
    this.cartStateMgmnt.preserveCartState.preserveCartItemsState();
    // this.cartItems$$.next([...newItemsArr]);
    // this.preserveCartState.preserveCartItemsState();
    // console.log(this.items$$.value);
  }

  removeCartItm(idx: number): void {
    const newItemsArr = [...this.cartStateMgmnt.getCartItems()];
    // const newItemsArr = [...this.cartItems$$.value];
    newItemsArr.splice(idx, 1);
    this.cartStateMgmnt.setCartItemsState(newItemsArr);
    this.cartStateMgmnt.preserveCartState.preserveCartItemsState();
    // this.cartItems$$.next([...newItemsArr]);
    // this.preserveCartState.preserveCartItemsState();
    // console.log(this.items$$.value);
  }

  updateCartItm(idx: number, color?: string, size?: string | number, qty?: number, prod?: number): void {
    // console.log(this.cartItems$$.value.at(idx));
    const newItemsArr = [...this.cartStateMgmnt.getCartItems()];
    // console.log(newItemsArr);
    let updatedItm = { ...newItemsArr[idx] };
    // const newItemsArr = [...this.cartItems$$.value];
    // let updatedItm = { ...this.cartItems$$.value[idx] };
    if (color || color == '') {
      updatedItm = { ...updatedItm, selectedColor: color };
    } else if (size || size == '') {
      updatedItm = { ...updatedItm, selectedSize: size };
    } else if (qty || qty == null || qty == 0) {
      qty = qty || NaN;
      prod = prod || 0;
      updatedItm = { ...updatedItm, selectedQuantity: qty, product: prod };
    }
    newItemsArr.splice(idx, 1, updatedItm);
    this.cartStateMgmnt.setCartItemsState(newItemsArr);
    this.cartStateMgmnt.preserveCartState.preserveCartItemsState();
    // this.cartItems$$.next([...newItemsArr]);
    // this.preserveCartState.preserveCartItemsState();
  }

  placeOrder(order: Order): Observable<DBOrder> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const { email, username, address, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status } = order;
    const body = JSON.stringify({ email, username, address, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status });
    return this.http.post<DBOrder>(ORDER_URL, body, { headers });
  }

  updateItmsRemainQty(purchasedItems: CartItem[]): Observable<Item[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return forkJoin([...this.buildUpdReqsArr.build(purchasedItems, headers)]);
  }

  createTradedItems(purchasedItems: CartItem[], status: 'pending', orderId: string): Observable<TradedItem[]> {
    const tradedItems: TradedItem[] = this.buildTradesReqsArr.buildTradedItemsArr([...purchasedItems], status, orderId,);
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return forkJoin([...this.buildTradesReqsArr.build(tradedItems, headers)]);
  }
}
