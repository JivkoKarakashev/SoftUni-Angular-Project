import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, filter, forkJoin, Observable } from 'rxjs';
import { Shipping } from '../types/shipping';
import { Discount } from '../types/discount';
import { CartItem } from '../types/cartItem';
import { CheckForItemType } from './utils/checkForItemType';

const SHIPPINGMETHODS_URL = 'http://localhost:3030/jsonstore/shipping';
const DISCOUNTS_URL = 'http://localhost:3030/jsonstore/discounts';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private cartItems$$ = new BehaviorSubject<CartItem[]>([]);
  private cartItems$ = this.cartItems$$.asObservable();

  constructor(private http: HttpClient, private checkForItemType: CheckForItemType) { }

  getCartItems(): Observable<CartItem[]> {
    // return this.http.get<Item[]>(URL);
    // return this.items$;
    return this.cartItems$;
  }

  getAvailablePurchaseServices() {
    return forkJoin([this.http.get<Discount[]>(DISCOUNTS_URL), this.http.get<Shipping[]>(SHIPPINGMETHODS_URL)]);
  }

  // getShippingMethods() {
  //   return this.http.get<Shipping[]>(SHIPPINGMETHODS_URL);
  // }

  // getDiscountCodes() {
  //   return this.http.get
  // }

  addCartItem(item: CartItem) {
    if (this.checkForItemType.isItem(item)) {
      throw new Error('Wrong cartItem type!');
    }
    this.cartItems$$.next([...this.cartItems$$.value, item]);
    // console.log(this.cartItems$$.value);
  }

  removeCartItems(ids: string[]) {
    // console.log(ids);
    const currItemsArr = [...this.cartItems$$.value];
    const newItemsArr = currItemsArr.filter(itm => !ids.includes(itm._id));
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
}
