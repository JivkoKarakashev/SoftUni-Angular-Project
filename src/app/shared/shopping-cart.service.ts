import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../types/item';
import { BehaviorSubject, map, filter, forkJoin } from 'rxjs';
import { Shipping } from '../types/shipping';
import { Discount } from '../types/discount';

const URL = 'http://localhost:3030/data/cart';
const SHIPPINGMETHODS_URL = 'http://localhost:3030/jsonstore/shipping';
const DISCOUNTS_URL = 'http://localhost:3030/jsonstore/discounts';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private items$$ = new BehaviorSubject<Item[]>([]);
  public items$ = this.items$$.asObservable();

  constructor(private http: HttpClient) { }

  getCartItems() {
    // return this.http.get<Item[]>(URL);
    // return this.items$;
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

  addCartItem(item: Item) {
    this.items$$.next([...this.items$$.value, item]);
    // console.log(this.items$$.value);
  }

  removeCartItems(ids: string[]) {
    // console.log(ids);
    this.items$$.pipe(map((items) => items.filter(itm => !ids.includes(itm._id))))
      .subscribe((res) => {
        // console.log(res);
        this.items$$.next([...res]);        
      });      
      // console.log(this.items$$.value);
  }

  removeCartItm(idx: number) {
    const newItemsArr = [...this.items$$.value];
    newItemsArr.splice(idx, 1);
    this.items$$.next(newItemsArr);
    // console.log(this.items$$.value);
  }

  emptyCart(): void {    
    this.items$$.next([]);
  }
}
