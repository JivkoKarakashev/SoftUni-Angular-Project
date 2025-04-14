import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import { EMPTY, Observable, Subscription, catchError, of, switchMap, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { CartItem, Item } from 'src/app/types/item';

import { UserStateManagementService } from '../state-management/user-state-management.service';
import { RelatedProductsService } from './related-products.service';
import { RelatedProductsPaginationConfig, RelatedProductsPaginationService, relatedProductsPaginationConfigInit } from '../utils/related-products-pagination.service';
import { ErrorsService } from '../errors/errors.service';
import { InvertColorService } from '../utils/invert-color.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { ToastrMessageHandlerService } from '../utils/toastr-message-handler.service';
import { ProductDetailsService } from '../product-details/product-details.service';
import { NgConfirmService } from 'ng-confirm-box';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';
import { CustomError } from '../errors/custom-error';
import { CarouselMoveAnimationState, RelatedProductAnimationState, relatedProductAddToCartButtonAnimation, relatedProductCarouselMoveAnimation, relatedProductDeleteAnimation } from '../animation-service/animations/related-products.animation';
import { AddToCartButtonAnimationState } from '../animation-service/animations/catalog-items.animation';
import { AnimationService } from '../animation-service/animation.service';
import { NgZoneOnStableEventProviderService } from '../utils/ng-zone-on-stable-event-provider.service';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.css'],
  animations: [
    relatedProductCarouselMoveAnimation,
    relatedProductDeleteAnimation,
    relatedProductAddToCartButtonAnimation
  ]
})
export class RelatedProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;
  public product: Item | null = null;
  public relatedProducts: Item[] = [];
  public filteredProducts: Item[] = [];
  public paginationConfig: RelatedProductsPaginationConfig = { ...relatedProductsPaginationConfigInit };
  public selected = {
    page: 0,
    pageSize: 3
  }
  public carouselMoveAnimationAnimationState: CarouselMoveAnimationState = 'static';
  public relatedProductsAnimationStatesArr: RelatedProductAnimationState[] = [];
  public addToCartButtonAnimationStateArr: AddToCartButtonAnimationState[] = [];
  public relatedProductCarouselMoveAnimationDisabled = true;
  public relatedProductDeleteAnimationDisabled = true;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private relatedProductsService: RelatedProductsService,
    private paginationService: RelatedProductsPaginationService,
    private errorsService: ErrorsService,
    private render: Renderer2,
    private invertColorService: InvertColorService,
    private cartService: ShoppingCartService,
    private router: Router,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private detailsService: ProductDetailsService,
    private animationService: AnimationService,
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService,
    private ngZone: NgZone,
    private ngZoneOnStableEventProviderService: NgZoneOnStableEventProviderService
  ) { }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef<HTMLSpanElement>>;
  @Output() relatedProductAddEvent = new EventEmitter();

  ngOnInit(): void {
    console.log('Related Products Page INITIALIZED!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    const product = this.detailsService.getProductDetails();
    if (product instanceof CustomError) {
      this.loading = false;
      const error = product;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
      this.customErrorsArr = [...this.customErrorsArr, { ...error }];
      return;
    }
    this.product = { ...product };
    const relProdCarouselMoveAnimationStateSub = this.animationService.getRelatedProductCarouselMoveAnimationState()
      .subscribe(state => this.relatedProductCarouselMoveAnimationDisabled = state);
    const relProdDetailsDeleteAnimationStateSub = this.animationService.getRelatedProductDeleteAnimationState()
      .subscribe(state => this.relatedProductDeleteAnimationDisabled = state);
    const fetchRelatedProductsSub = this.fetchRelatedProducts()
      .subscribe((res) => {
        if (res instanceof CustomError) {
          const error = { ...res };
          this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
          this.customErrorsArr = [...this.customErrorsArr, { ...error }];
        }
      });
    this.unsubscriptionArray.push(relProdCarouselMoveAnimationStateSub, relProdDetailsDeleteAnimationStateSub, fetchRelatedProductsSub);
  }
  ngAfterViewInit(): void {
    // console.log(this.spanColorElements);
    const spanElementsSubscription = this.spanColorElements.changes.subscribe((els: QueryList<ElementRef<HTMLSpanElement>>) => {
      els.forEach(el => {
        const color = el.nativeElement.getAttribute('color');
        if (color) {
          const hexColor = this.invertColorService.nameToHex(color);
          this.render.setStyle(el.nativeElement, 'background-color', hexColor);
        }
      });
    });
    this.unsubscriptionArray.push(spanElementsSubscription);
  }
  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 4 - infinity');
  }

  onRelatedProductAdd(i: number): void {
    this.addToCartButtonAnimationStateArr[i] = { ...this.addToCartButtonAnimationStateArr[i], animateState: 'animate', btnText: '' };
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.filteredProducts[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    this.cartService.addCartItem({ ...newCartItem });
    // this.relatedProductAddEvent.emit();
    // this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
  }
  onRelatedProductEdit(i: number): void {
    this.animationService.disableDetailsAnimations();
    this.confirmService.showConfirm('Edit this item?',
      () => {
        this.catalogManagerService.setCatalogItemToEdit({ ...this.filteredProducts[i] });
        this.router.navigate(['/edit-product']);
      },
      () => { return; }
    );
  }
  onRelatedProductDelete(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        this.relatedProductsAnimationStatesArr[i] = 'delete';
      },
      () => { return; }
    );
  }

  private relatedProductDelete(i: number): Observable<Item[] | CustomError> {
    this.loading = true;
    const { _id, subCat } = this.filteredProducts[i];
    return this.catalogManagerService.deleteItem(subCat, _id)
      .pipe(
        catchError(err => {
          this.loading = false;
          this.relatedProductsAnimationStatesArr[i] = 'static';
          const errMsg: string = err.error.message;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          this.toastrMessageHandler.showError(errMsg);
          return EMPTY;
        }
        ),
        switchMap(() => {
          return this.fetchRelatedProducts()
            .pipe(
              tap((res) => {
                if (res instanceof CustomError) {
                  const error = { ...res };
                  this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
                  this.customErrorsArr = [...this.customErrorsArr, { ...error }];
                  return;
                }
                this.loading = false;
                this.toastrMessageHandler.showInfo()
              })
            );
        }),
      );
  }

  setAnimationStates(): void {
    this.addToCartButtonAnimationStateArr = Array.from({ length: this.filteredProducts.length }, () => ({ animateState: 'static', btnText: '' }) as AddToCartButtonAnimationState);
    this.relatedProductsAnimationStatesArr = Array.from({ length: this.filteredProducts.length }, () => 'static' as RelatedProductAnimationState);
  }

  onRelatedProductDeleteAnimation(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done') {
      if (e.fromState === 'static' && e.toState === 'delete' && i !== undefined) {
        const deleteSub = this.relatedProductDelete(i).subscribe();
        this.unsubscriptionArray.push(deleteSub);
      }
    }
  }

  onAddToCartButtonAnimation(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start' && e.fromState === 'static' && e.toState === 'animate') {
      const btnIconEl = e.element.querySelector('i.fa-solid');
      this.render.removeClass(btnIconEl, 'fa-cart-arrow-down');
      this.render.addClass(btnIconEl, 'fa-circle-check');
      this.render.setStyle(e.element, 'pointer-events', 'none');
    } else if (e.phaseName === 'done' && e.fromState === 'static' && e.toState === 'animate') {
      const btnIconEl = e.element.querySelector('i.fa-solid');
      this.render.removeClass(btnIconEl, 'fa-circle-check');
      this.render.addClass(btnIconEl, 'fa-cart-arrow-down');
      this.render.setStyle(e.element, 'pointer-events', 'initial');
      this.addToCartButtonAnimationStateArr[i] = { ...this.addToCartButtonAnimationStateArr[i], animateState: 'static', btnText: '' };
      this.relatedProductAddEvent.emit();
      this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
    }

  }

  onDetailsChange(e: Event, i: number) {
    e.preventDefault();
    const { _id, cat, subCat } = this.filteredProducts[i];
    const newPath = `/catalog/${cat}/${subCat}/${_id}`;
    this.animationService.disableDetailsAnimations();
    this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
      .subscribe(
        () => this.ngZone.run(
          () => this.router.navigate([newPath])
        )
      );
  }

  public trackById(_index: number, product: Item): string {
    // console.log(slide._id);
    return product._id;
  }

  onCarouselMove(selectedPage: number) {
    this.selected.page = selectedPage || 1;
    this.carouselMoveAnimationAnimationState = 'leave';
    this.filteredProducts = [];
  }

  onCarouselMoveAnimation(e: AnimationEvent): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done' && this.carouselMoveAnimationAnimationState === 'leave') {
      this.carouselMoveAnimationAnimationState = 'enter';
      const fetchRelatedProductsSub = this.fetchRelatedProducts()
        .subscribe(res => {
          if (res instanceof CustomError) {
            const error = { ...res };
            this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
            this.customErrorsArr = [...this.customErrorsArr, { ...error }];
          }
        });
      this.unsubscriptionArray.push(fetchRelatedProductsSub);
    } else
      if (e.phaseName === 'done' && this.carouselMoveAnimationAnimationState === 'enter') {
        console.log(this.carouselMoveAnimationAnimationState);
        this.carouselMoveAnimationAnimationState = 'static';
        console.log(this.carouselMoveAnimationAnimationState);
      }

  }

  private fetchRelatedProducts(): Observable<Item[] | CustomError> {
    this.loading = true;
    return this.relatedProductsService.getCollectionSize()
      .pipe(
        catchError(err => {
          this.loading = false;
          const errMsg: string = err.error.message;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          this.toastrMessageHandler.showError(errMsg);
          return EMPTY;
        }),
        switchMap(res => {
          if (res instanceof CustomError) {
            this.loading = false;
            const error = { ...res };
            return of(error);
          }
          if (res === 0) {
            this.loading = false;
            const error = this.customError();
            return of(error);
          }
          const collectionSize = res;
          this.paginationConfig = this.paginationService.relatedProductsPaginationConfigCalc(collectionSize, this.selected.pageSize, this.selected.page);
          const { selectedPage, skipSizeReq, pageSizeReq } = this.paginationConfig;
          this.selected.page = selectedPage;
          return this.relatedProductsService.getRelatedProductsByPage(skipSizeReq, pageSizeReq)
            .pipe(
              catchError(err => {
                this.loading = false;
                const errMsg: string = err.error.message;
                this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
                this.toastrMessageHandler.showError(errMsg);
                return EMPTY;
              }),
              tap(res => {
                this.loading = false;
                if (res instanceof CustomError) {
                  return;
                }
                this.relatedProducts = [...res];
                // if (this.carouselMoveAnimationAnimationState !== 'leave') {
                this.filteredProducts = res.filter(itm => itm._id !== this.product?._id);
                // }
                this.setAnimationStates();
                this.animationService.enableDetailsAnimations();
              }
              )
            );
        }),
      );
  }

  private customError(): CustomError {
    const name = 'Collection Size Error';
    const message = 'Collection is EMPTY!';
    const isUserError = false;
    return new CustomError(name, message, isUserError);
  }
}
