import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ShoppingCartAnimationState } from './animations/shopping-cart.animation';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  //                              <--- Catalog Components Animations --->                              //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  private catalogItemEnterLeaveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private catalogItemEnterLeaveAnimationDisabled$ = this.catalogItemEnterLeaveAnimationDisabled$$.asObservable();

  private catalogItemDeleteAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private catalogItemDeleteAnimationDisabled$ = this.catalogItemDeleteAnimationDisabled$$.asObservable();
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //                         <--- Product Details Component Animations --->                         //
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  private productDetailsDeleteAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private productDetailsDeleteAnimationDisabled$ = this.productDetailsDeleteAnimationDisabled$$.asObservable();

  private productDetailsCarouselMoveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private productDetailsCarouselMoveAnimationDisabled$ = this.productDetailsCarouselMoveAnimationDisabled$$.asObservable();
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  //                         <--- Related Products Component Animations --->                         //
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  private relatedProductCarouselMoveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private relatedProductCarouselMoveAnimationDisabled$ = this.relatedProductCarouselMoveAnimationDisabled$$.asObservable();
  
  private relatedProductDeleteAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private relatedProductDeleteAnimationDisabled$ = this.relatedProductDeleteAnimationDisabled$$.asObservable();
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //                         <--- Shopping Cart Component Animations --->                         //
  //////////////////////////////////////////////////////////////////////////////////////////////////
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
  ////////////////////////////////////////////////////////////////////////
  // <--- Product Details Carousel Move Animation State Management ---> //
  ////////////////////////////////////////////////////////////////////////
  getProductDetailsCarouselMoveAnimationState(): Observable<boolean> {
    return this.productDetailsCarouselMoveAnimationDisabled$;
  }

  disableProductDetailsCarouselMoveAnimation(): void {
    this.productDetailsCarouselMoveAnimationDisabled$$.next(true);
  }

  enableProductDetailsCarouselMoveAnimation(): void {
    this.productDetailsCarouselMoveAnimationDisabled$$.next(false);
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
   ///////////////////////////////////////////////////////////////////////
  // <--- Related Product Carousel Move Animation State Management ---> //
  ////////////////////////////////////////////////////////////////////////
  getRelatedProductCarouselMoveAnimationState(): Observable<boolean> {
    return this.relatedProductCarouselMoveAnimationDisabled$;
  }

  disableRelatedProductCarouselMoveAnimation(): void {
    this.relatedProductCarouselMoveAnimationDisabled$$.next(true);
  }

  enableRelatedProductCarouselMoveAnimation(): void {
    this.relatedProductCarouselMoveAnimationDisabled$$.next(false);
  }
  /////////////////////////////////////////////////////////////////
  // <--- Related Product Delete Animation State Management ---> //
  /////////////////////////////////////////////////////////////////
  getRelatedProductDeleteAnimationState(): Observable<boolean> {
    return this.relatedProductDeleteAnimationDisabled$;
  }

  disableRelatedProductDeleteAnimation(): void {
    this.relatedProductDeleteAnimationDisabled$$.next(true);
  }

  enableRelatedProductDeleteAnimation(): void {
    this.relatedProductDeleteAnimationDisabled$$.next(false);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // <--- Enable/Disable all Animations for Product Details Component and Related Products Component ---> //
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  enableDetailsAnimations(): void {
    this.productDetailsCarouselMoveAnimationDisabled$$.next(false);
    this.productDetailsDeleteAnimationDisabled$$.next(false);
    this.relatedProductCarouselMoveAnimationDisabled$$.next(false);
    this.relatedProductDeleteAnimationDisabled$$.next(false);
  }

  disableDetailsAnimations(): void {
    this.productDetailsCarouselMoveAnimationDisabled$$.next(true);
    this.productDetailsDeleteAnimationDisabled$$.next(true);
    this.relatedProductCarouselMoveAnimationDisabled$$.next(true);
    this.relatedProductDeleteAnimationDisabled$$.next(true);
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
    this.productDetailsCarouselMoveAnimationDisabled$$.next(false);
    this.relatedProductCarouselMoveAnimationDisabled$$.next(false);
    this.relatedProductDeleteAnimationDisabled$$.next(false);
  }

  disableAllAnimations(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(true);
    this.catalogItemDeleteAnimationDisabled$$.next(true);
    this.productDetailsDeleteAnimationDisabled$$.next(true);
    this.productDetailsCarouselMoveAnimationDisabled$$.next(true);
    this.relatedProductCarouselMoveAnimationDisabled$$.next(true);
    this.relatedProductDeleteAnimationDisabled$$.next(true);
  }
}
