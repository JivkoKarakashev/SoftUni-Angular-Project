import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CartItem } from 'src/app/types/item';
import { Discount, discountInitialState } from 'src/app/types/discount';
import { Shipping, shippingInitialState } from 'src/app/types/shipping';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartStateManagementService {
  private cartItems$$ = new BehaviorSubject<CartItem[]>([]);
  private cartItems$ = this.cartItems$$.asObservable();
  private discountState$$ = new BehaviorSubject<Discount>({ ...discountInitialState });
  private discountState$ = this.discountState$$.asObservable();
  private shippingState$$ = new BehaviorSubject<Shipping>({ ...shippingInitialState });
  private shippingState$ = this.shippingState$$.asObservable();

  /////////////////////<--- Cart State Management--->/////////////////////
  getCartItemsState(): Observable<CartItem[]> {
    return this.cartItems$;
  }
  getCartItems(): CartItem[] {
    return this.cartItems$$.value;
  }
  getCartItemsCount(): number {
    return this.cartItems$$.value.length;
  }

  setCartItemsState(cartState: CartItem[]): void {
    this.cartItems$$.next([...cartState]);
  }

  updateCartItemsState(cartItem: CartItem): void {
    this.cartItems$$.next([...this.cartItems$$.value, { ...cartItem }]);
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

  emptyCart(): void {
    this.cartItems$$.next([]);
    this.discountState$$.next({ ...discountInitialState });
    this.shippingState$$.next({ ...shippingInitialState });
    this.clearCartState();
  }

  /////////////////////<--- Discount State Management--->/////////////////////
  getDiscountState(): Observable<Discount> {
    return this.discountState$;
  }
  getDiscount(): Discount {
    return this.discountState$$.value;
  }

  setDiscountState(code: string, rate: number): void {
    // console.log('Code:', code);
    // console.log('Rate:', rate);
    this.discountState$$.next({ ...this.discountState$$.value, code: code, rate: rate });
    this.preserveCartState.preserveDiscountState();
    // console.log(this.discountState$$.value);
  }

  /////////////////////<--- Shipping State Management--->/////////////////////
  getShippingState(): Observable<Shipping> {
    return this.shippingState$;
  }
  getShipping(): Shipping {
    return this.shippingState$$.value;
  }

  setShippingState(name: string, value: number): void {
    // console.log('Name:', name);
    // console.log('Value:', value);
    this.shippingState$$.next({ ...this.shippingState$$.value, name: name, value: value });
    this.preserveCartState.preserveShippingState();
    // console.log(this.shippingState$$.value);
  }
}
