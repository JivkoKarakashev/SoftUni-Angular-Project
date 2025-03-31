import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ShoppingCartAnimationState } from './animations/shopping-cart.animation';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private catalogItemEnterLeaveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private catalogItemEnterLeaveAnimationDisabled$ = this.catalogItemEnterLeaveAnimationDisabled$$.asObservable();

  private catalogItemDeleteAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private catalogItemDeleteAnimationDisabled$ = this.catalogItemDeleteAnimationDisabled$$.asObservable();

  private productDetailsDeleteAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private productDetailsDeleteAnimationDisabled$ = this.productDetailsDeleteAnimationDisabled$$.asObservable();

  private carouselMoveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private carouselMoveAnimationDisabled$ = this.carouselMoveAnimationDisabled$$.asObservable();

  private shoppingCartAnimationState$$ = new BehaviorSubject<ShoppingCartAnimationState>('none');
  private shoppingCartAnimationState$ = this.shoppingCartAnimationState$$.asObservable();
  ///////////////////////////////////////////////////////////////////////
  // <--- Catalog Item Enter <=> Leave Animation State Management ---> //
  ///////////////////////////////////////////////////////////////////////
  getCatalogItemEnterLeaveAnimationState(): Observable<boolean> {
    return this.catalogItemEnterLeaveAnimationDisabled$;
  }

  disableCatalogItemEnterLeaveAnimation(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(true);
  }

  enableCatalogItemEnterLeaveAnimation(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(false);
  }
  //////////////////////////////////////////////////////////////
  // <--- Catalog Item Delete Animation State Management ---> //
  //////////////////////////////////////////////////////////////
  getCatalogItemDeleteAnimationState(): Observable<boolean> {
    return this.catalogItemDeleteAnimationDisabled$;
  }

  disableCatalogItemDeleteAnimation(): void {
    this.catalogItemDeleteAnimationDisabled$$.next(true);
  }

  enableCatalogItemDeleteAnimation(): void {
    this.catalogItemDeleteAnimationDisabled$$.next(false);
  }
  ///////////////////////////////////////////////////////////////
  // <--- Enable/Disable all Animations for Catalog Items ---> //
  ///////////////////////////////////////////////////////////////
  enableCatalogItemAnimations(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(false);
    this.catalogItemDeleteAnimationDisabled$$.next(false);
  }

  disableCatalogItemAnimations(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(true);
    this.catalogItemDeleteAnimationDisabled$$.next(true);
  }
  ////////////////////////////////////////////////////////
  // <--- Carousel Move Animation State Management ---> //
  ////////////////////////////////////////////////////////
  getCarouselMoveAnimationState(): Observable<boolean> {
    return this.carouselMoveAnimationDisabled$;
  }

  disableCarouselMoveAnimation(): void {
    this.carouselMoveAnimationDisabled$$.next(true);
  }

  enableCarouselMoveAnimation(): void {
    this.carouselMoveAnimationDisabled$$.next(false);
  }
  /////////////////////////////////////////////////////////////////
  // <--- Product Details Delete Animation State Management ---> //
  /////////////////////////////////////////////////////////////////
  getProductDetailsDeleteAnimationState(): Observable<boolean> {
    return this.productDetailsDeleteAnimationDisabled$;
  }

  disableProductDetailsDeleteAnimation(): void {
    this.productDetailsDeleteAnimationDisabled$$.next(true);
  }

  enableProductDetailsDeleteAnimation(): void {
    this.productDetailsDeleteAnimationDisabled$$.next(false);
  }
  ////////////////////////////////////////////////////////
  // <--- Shopping Cart Animation State Management ---> //
  ////////////////////////////////////////////////////////
  getShoppingCartAnimationState(): Observable<ShoppingCartAnimationState> {
    return this.shoppingCartAnimationState$;
  }

  setShoppingCartAnimationState(state: ShoppingCartAnimationState): void {
    this.shoppingCartAnimationState$$.next(state);
  }
  /////////////////////////////////////////////
  // <--- Enable/Disable all Animations ---> //
  /////////////////////////////////////////////
  enableAllAnimations(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(false);
    this.catalogItemDeleteAnimationDisabled$$.next(false);
    this.productDetailsDeleteAnimationDisabled$$.next(false);
    this.carouselMoveAnimationDisabled$$.next(false);
  }

  disableAllAnimations(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(true);
    this.catalogItemDeleteAnimationDisabled$$.next(true);
    this.productDetailsDeleteAnimationDisabled$$.next(true);
    this.carouselMoveAnimationDisabled$$.next(true);
  }
}
