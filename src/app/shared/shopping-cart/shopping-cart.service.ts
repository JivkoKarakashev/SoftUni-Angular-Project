import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

import { Shipping, shippingInitialState } from '../../types/shipping';
import { Discount, discountInitialState } from '../../types/discount';
import { CartItem } from '../../types/cartItem';
import { CheckForItemTypeService } from '../utils/check-for-item-type.service';
import { DBOrder, Order } from '../../types/order';
import { HttpLogoutInterceptorSkipHeader } from '../../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../../interceptors/http-ajax.interceptor';
import { Item } from 'src/app/types/item';
import { BuildUpdateRequestsArrayService } from '../utils/build-update-requests-array.service';

const SHIPPINGMETHODS_URL = 'http://localhost:3030/data/shipping';
const DISCOUNTS_URL = 'http://localhost:3030/data/discounts';
const ORDER_URL = 'http://localhost:3030/data/order';
const BASE_URL = 'http://localhost:3030/data';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private cartItems$$ = new BehaviorSubject<CartItem[]>([]);
  private cartItems$ = this.cartItems$$.asObservable();
  private discountState$$ = new BehaviorSubject<Discount>({ ...discountInitialState });
  private discountState$ = this.discountState$$.asObservable();
  private shippingState$$ = new BehaviorSubject<Shipping>({ ...shippingInitialState });
  private shippingState$ = this.shippingState$$.asObservable();

  constructor(private http: HttpClient, private checkForItemType: CheckForItemTypeService, private buildUpdReqsArr: BuildUpdateRequestsArrayService) { }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  setCartItems(cartState: CartItem[]): void {
    this.cartItems$$.next([...cartState]);
  }

  preserveCartState = {
    preserveCartItemsState: (): void => localStorage.setItem('cartItemsState', JSON.stringify([...this.cartItems$$.value])),
    preserveDiscountState: (): void => localStorage.setItem('discountState', JSON.stringify({ ...this.discountState$$.value })),
    preserveShippingState: (): void => localStorage.setItem('shippingState', JSON.stringify({ ...this.shippingState$$.value }))
  };

  private clearCartState(): void {
    localStorage.removeItem('cartItemsState');
    localStorage.removeItem('discountState');
    localStorage.removeItem('shippingState');
    console.log('CLEAR CART STATE INVOKED!');
  }

  getDiscountState(): Observable<Discount> {
    return this.discountState$;
  }

  setDiscountState(code: string, rate: number): void {
    // console.log('Code:', code);
    // console.log('Rate:', rate);
    this.discountState$$.next({ ...this.discountState$$.value, code: code, rate: rate });
    this.preserveCartState.preserveDiscountState();
    // console.log(this.discountState$$.value);
  }

  getShippingState(): Observable<Shipping> {
    return this.shippingState$;
  }

  setShippingState(name: string, value: number): void {
    // console.log('Name:', name);
    // console.log('Value:', value);
    this.shippingState$$.next({ ...this.shippingState$$.value, name: name, value: value });
    this.preserveCartState.preserveShippingState();
    // console.log(this.shippingState$$.value);
  }

  getAvailablePurchaseServices(): Observable<[Discount[], Shipping[]]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Discount[]>(DISCOUNTS_URL, { headers }),
      this.http.get<Shipping[]>(SHIPPINGMETHODS_URL, { headers })
    ]);
  }

  addCartItem(item: CartItem): void {
    if (this.checkForItemType.isItem(item)) {
      throw new Error('Wrong cartItem type!');
    }
    this.cartItems$$.next([...this.cartItems$$.value, item]);
    this.preserveCartState.preserveCartItemsState();
    // console.log(this.cartItems$$.value);
  }

  removeCartItems(idxArr: number[]): void {
    // console.log(idxArr);
    const newItemsArr = [...this.cartItems$$.value];
    for (let i = idxArr.length - 1; i >= 0; i--) {
      newItemsArr.splice(idxArr[i], 1);
    }
    // console.log(newItemsArr);
    this.cartItems$$.next([...newItemsArr]);
    this.preserveCartState.preserveCartItemsState();
    // console.log(this.items$$.value);
  }

  removeCartItm(idx: number): void {
    const newItemsArr = [...this.cartItems$$.value];
    newItemsArr.splice(idx, 1);
    this.cartItems$$.next([...newItemsArr]);
    this.preserveCartState.preserveCartItemsState();
    // console.log(this.items$$.value);
  }

  updateCartItm(idx: number, color?: string, size?: string | number, qty?: number, prod?: number): void {
    // console.log(this.cartItems$$.value.at(idx));
    const newItemsArr = [...this.cartItems$$.value];
    let updatedItm = { ...this.cartItems$$.value[idx] };
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
    this.cartItems$$.next([...newItemsArr]);
    this.preserveCartState.preserveCartItemsState();
  }

  emptyCart(): void {
    this.cartItems$$.next([]);
    this.discountState$$.next({ ...discountInitialState });
    this.shippingState$$.next({ ...shippingInitialState });
    this.clearCartState();
  }

  placeOrder(order: Order): Observable<DBOrder> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const { email, username, address, purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status } = order;
    const body = JSON.stringify({ email, username, address, purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status });
    return this.http.post<DBOrder>(ORDER_URL, body, { headers });
  }

  updateItmsRemainQty(purchasedItems: CartItem[]): Observable<Item[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    return forkJoin([...this.buildUpdReqsArr.build(purchasedItems, headers)]);
  }
}
