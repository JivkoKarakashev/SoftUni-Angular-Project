import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

@Injectable({
  providedIn: 'root'
})
export class ProfileDataStateManagementService {
  private orders$$ = new BehaviorSubject<DBOrder[]>([]);
  private orders$ = this.orders$$.asObservable();
  private purchasedItemsByOrder$$ = new BehaviorSubject<Array<TradedItem[]>>([]);
  private purchasedItemsByOrder$ = this.purchasedItemsByOrder$$.asObservable();
  private soldItems$$ = new BehaviorSubject<TradedItem[]>([]);
  private soldItems$ = this.soldItems$$.asObservable();

  constructor() { }

  /////////////////////<--- Orders State Management--->/////////////////////
  getOrdersState(): Observable<DBOrder[]> {
    return this.orders$;
  }
  getOrders(): DBOrder[] {
    return this.orders$$.value;
  }

  setOrdersState(ordersState: DBOrder[]): void {
    this.orders$$.next([...ordersState]);
  }

  /////////////////////<--- Purchased Items in groups by Order - State Management--->/////////////////////
  getPurchasedItemsByOrderState(): Observable<TradedItem[][]> {
    return this.purchasedItemsByOrder$;
  }
  getPurchasedItemsByOrder(): Array<TradedItem[]> {
    return this.purchasedItemsByOrder$$.value;
  }

  setPurchasedItemsByOrderState(purchasedItemsByOrderState: TradedItem[][]): void {
    this.purchasedItemsByOrder$$.next([...purchasedItemsByOrderState]);
  }

  /////////////////////<--- Sold Items State Management--->/////////////////////
  geSoldItemsState(): Observable<TradedItem[]> {
    return this.soldItems$;
  }
  getSoldItems(): TradedItem[] {
    return this.soldItems$$.value;
  }

  setSoldItemsState(soldItemsState: TradedItem[]): void {
    this.soldItems$$.next([...soldItemsState]);
  }

  clearProfileDataState(): void {
    this.orders$$.next([]);
    this.purchasedItemsByOrder$$.next([]);
    this.soldItems$$.next([]);
    console.log(this.orders$$.value);
    console.log(this.purchasedItemsByOrder$$.value);
    console.log(this.soldItems$$.value);
  }
}
