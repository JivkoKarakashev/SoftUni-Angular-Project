import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type mobileNavMenuState = 'open' | 'closed' | 'navigate';

@Injectable({
  providedIn: 'root'
})
export class HeaderMobileService {

  private mobileNavMenuState$$ = new BehaviorSubject<mobileNavMenuState>('closed');
  private mobileNavMenuState$ = this.mobileNavMenuState$$.asObservable();

  private siteContainerHeight$$ = new BehaviorSubject<number>(0);
  private siteContainerHeight$ = this.siteContainerHeight$$.asObservable();

  // <--- Mobile Navigation Menu State Management ---> //
  getMobileNavMenuState(): Observable<mobileNavMenuState> {
    return this.mobileNavMenuState$;
  }

  setMobileNavMenuState(state: mobileNavMenuState): void {
    this.mobileNavMenuState$$.next(state);
  }
  // <--- Site Container's Height State Management ---> //
  getSiteContainerHeight(): Observable<number> {
    return this.siteContainerHeight$;
  }

  setSiteContainerHeight(siteContainerHeight: number): void {
    this.siteContainerHeight$$.next(siteContainerHeight);
    // console.log(this.siteContainerHeight$$.value);
  }
}
