import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { TradedItem } from 'src/app/types/item';

import { CheckForItemTypeService } from '../utils/check-for-item-type.service';

@Injectable({
  providedIn: 'root'
})
export class TradedItemsStateManagementService {
  private dbTradedItemsState$$ = new BehaviorSubject<TradedItem[]>([]);
  private dbTradedItemsState$ = this.dbTradedItemsState$$.asObservable();

  constructor(private checkType: CheckForItemTypeService) { }

  /////////////////////<--- Traded Items State Management--->/////////////////////
  getDBTradedItemsState(): Observable<TradedItem[]> {
    return this.dbTradedItemsState$;
  }
  getDBTradedItems(): TradedItem[] {
    return this.dbTradedItemsState$$.value;
  }

  setDBTradedItemsState(dbTradedItemsState: TradedItem[]): void {
    if (this.checkType.isTradedItemsArr(dbTradedItemsState)) {
      this.dbTradedItemsState$$.next([...dbTradedItemsState]);
      this.preserveDBTradedItemsState();
    } else {
      throw new Error('Wrong Traded Item type!');
    }
  }

  private preserveDBTradedItemsState(): void {
    localStorage.setItem('dbTradedItemsState', JSON.stringify([...this.dbTradedItemsState$$.value]));
  }

  removeDBTradedItemsStateFromLStor(): void {
    localStorage.removeItem('dbTradedItemsState');
    console.log('REMOVE DATABASE TRADED ITEMS STATE FROM LSTOR INVOKED!');
  }

  resetDBTradedItemsState(): void {
    this.dbTradedItemsState$$.next([]);
    this.removeDBTradedItemsStateFromLStor();
  }
}
