import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DBOrder, dbOrderInitialState } from 'src/app/types/order';

import { CheckForItemTypeService } from '../utils/check-for-item-type.service';

@Injectable({
  providedIn: 'root'
})
export class OrderStateManagementService {
  private dbOrderState$$ = new BehaviorSubject<DBOrder | null>(null);
  private dbOrderState$ = this.dbOrderState$$.asObservable();
  
  constructor(private checkType: CheckForItemTypeService) { }

  /////////////////////<--- Order State Management--->/////////////////////
  getDBOrderState(): Observable<DBOrder | null> {
    return this.dbOrderState$;
  }
  getDBOrder(): DBOrder | null {
    return this.dbOrderState$$.value;
  }

  setDBOrderState(dbOrderState: DBOrder): void {
    if (this.checkType.isDBOrder(dbOrderState)) {
      this.dbOrderState$$.next({ ...this.dbOrderState$$.value, ...dbOrderState });
      this.preserveDBOrderState();
    } else if (this.checkType.isOrder(dbOrderState)) {
      throw new Error('Wrong Order type!');
    }
  }

  private preserveDBOrderState(): void {
    localStorage.setItem('dbOrderState', JSON.stringify({ ...this.dbOrderState$$.value }));
  }

  removeDBOrderStateFromLStor(): void {
    localStorage.removeItem('dbOrderState');
    console.log('REMOVE DATABASE ORDER STATE FROM LSTOR INVOKED!');
  }

  resetDBOrderState(): void {
    this.dbOrderState$$.next(null);
    this.removeDBOrderStateFromLStor();
  }
}
