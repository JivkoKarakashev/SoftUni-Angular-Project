import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AnimationEvent } from '@angular/animations';
import { EMPTY, Subscription, catchError, switchMap, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from '../state-management/user-state-management.service';

import { CartItem, Item } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { ProductDetailsService } from './product-details.service';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { CustomError } from '../errors/custom-error';
import { ErrorsService } from '../errors/errors.service';
import { ToastrMessageHandlerService } from '../utils/toastr-message-handler.service';
import { NgConfirmService } from 'ng-confirm-box';
import { CapitalizeCategoryService } from '../utils/capitalize-category.service';
import { InvertColorService } from '../utils/invert-color.service';
import { CarouselImageUrl, carouselMoveAnimation, detailsDeleteAnimation } from '../animation-service/animations/product-details.animation';
import { AnimationService } from '../animation-service/animation.service';
import { NgZoneOnStableEventProviderService } from '../utils/ng-zone-on-stable-event-provider.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  animations: [
    carouselMoveAnimation,
    detailsDeleteAnimation
  ]
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;

  public item: Item | null = null;
  public cartItemsCounter = 0;
  public selectedImgUrl = '';
  public showScrollUpBtn = false;

  public carouselImages: CarouselImageUrl[] = [];
  public selectedImageIdx: number | null = 0; // Controls displayed image
  public pendingIndex: number | null = null; // Controls animation
  public animationDirection: 'right' | 'left' = 'right';
  public detailsDeleteAnimationDisabled = true;
  public carouselMoveAnimationDisabled = true;
  public itemState: 'static' | 'delete' = 'static';

  public form: FormGroup = this.fb.group({
    fgItem: this.fb.group({
      _ownerId: [''],
      _id: [''],
      _createdOn: [''],
      image: [''],
      altImages: [''],
      cat: [''],
      subCat: [''],
      description: [''],
      brand: [''],
      size: [''],
      selectedSize: ['', [Validators.required,]],
      color: [''],
      selectedColor: ['', [Validators.required,]],
      quantity: [''],
      selectedQuantity: ['', [Validators.required,]],
      price: ['']
    }),
  });

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private errorsService: ErrorsService,
    private router: Router,
    private render: Renderer2,
    private cartService: ShoppingCartService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private invertColorService: InvertColorService,
    private viewportScroller: ViewportScroller,
    private detailsService: ProductDetailsService,
    private animationService: AnimationService,
    private ngZone: NgZone,
    private ngZoneOnStableEventProviderService: NgZoneOnStableEventProviderService
  ) { this.cartItemsCounter = this.cartStateMgmnt.getCartItemsCount() }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef>;
  @ViewChild('prevCarouselButton') private prevCarouselButton!: ElementRef<HTMLDivElement>;
  @ViewChild('nextCarouselButton') private nextCarouselButton!: ElementRef<HTMLDivElement>;

  @HostListener('window:scroll')
  onWindowScroll() {
    const [, yPos] = this.viewportScroller.getScrollPosition();
    if (yPos > 350 && !this.showScrollUpBtn) {
      this.showScrollUpBtn = true;
    } else if (yPos <= 350 && this.showScrollUpBtn) {
      this.showScrollUpBtn = false;
    }
  }

  get itemCtrlsGr() {
    return this.form.get("fgItem") as FormGroup;
  }

  ngOnInit(): void {
    // console.log('Details Page INITIALIZED!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    const detailsDeleteAnimationStateSub = this.animationService.getProductDetailsDeleteAnimationState()
      .subscribe(state => this.detailsDeleteAnimationDisabled = state);
    const carouselMoveAnimationStateSub = this.animationService.getProductDetailsCarouselMoveAnimationState()
      .subscribe(state => this.carouselMoveAnimationDisabled = state);
    const pathChangeSub = this.activatedRoute.params
      .pipe(
        switchMap(() => this.fetchProductDetails())
      )
      .subscribe();
    this.unsubscriptionArray.push(detailsDeleteAnimationStateSub, carouselMoveAnimationStateSub, pathChangeSub);
  }

  ngAfterViewInit(): void {
    const spanElementsSubscription = this.spanColorElements.changes.subscribe((els: QueryList<ElementRef>) => {
      els.forEach((el, i) => {
        const hexColor = this.invertColorService.nameToHex(this.itemCtrlsGr.get('color')?.value[i]);
        this.render.setStyle(el.nativeElement, 'background-color', hexColor);
      });
    });
    this.unsubscriptionArray.push(spanElementsSubscription);
  }

  ngOnDestroy(): void {
    this.detailsService.resetProductDetails();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 4');
  }

  private fetchProductDetails() {
    this.loading = true;
    const [, , collection, id] = this.activatedRoute.snapshot.url;
    const url = `/${collection}/${id}`;
    return this.detailsService.fetchProductDetailsByUrl(url)
      .pipe(
        catchError(err => {
          this.loading = false;
          if (err.status === 404) {
            this.router.navigate(['**']);
          } else {
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          }
          return EMPTY;
        }),
        tap(details => {
          this.loading = false;
          this.item = { ...details };
          this.carouselImages = [details.image, ...details.altImages];
          this.selectedImageIdx = 0;
          this.detailsService.setProductDetails(details);
          this.populateForm();
        })
      );
  }

  onCarouselMoveAnimation(e: AnimationEvent) {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done') {
      if (e.fromState !== null && e.toState === null) {
        this.updateSelectedImageIdx();
      } else if (e.fromState === null && e.toState !== null) {
        this.enableCarouselButtons();
      }
    }
  }

  onPrevImage() {
    if (this.selectedImageIdx !== null && this.selectedImageIdx > 0) {
      this.disableCarouselButtons();
      this.animationDirection = 'right';
      // console.log("Prev Image Clicked ✅: Moving Right");
      this.triggerCarouselAnimation(this.selectedImageIdx - 1);
    }
  }

  onNextImage() {
    if (!this.item) {
      return;
    }
    if (this.selectedImageIdx !== null && this.selectedImageIdx < this.carouselImages.length - 1) {
      this.disableCarouselButtons();
      this.animationDirection = 'left';
      // console.log("Next Image Clicked ✅: Moving Left");
      this.triggerCarouselAnimation(this.selectedImageIdx + 1);
    }
  }

  private updateSelectedImageIdx(): void {
    this.selectedImageIdx = this.pendingIndex;
    this.pendingIndex = null; //Reset pendingIndex State
  }

  private triggerCarouselAnimation(selectedImageIdx: number): void {
    this.pendingIndex = selectedImageIdx;
    this.selectedImageIdx = null;
  }

  private enableCarouselButtons(): void {
    const prevButton = this.prevCarouselButton.nativeElement;
    const nextButton = this.nextCarouselButton.nativeElement;
    this.render.removeClass(prevButton, 'not-clickable');
    this.render.removeClass(nextButton, 'not-clickable');
  }
  private disableCarouselButtons(): void {
    const prevButton = this.prevCarouselButton.nativeElement;
    const nextButton = this.nextCarouselButton.nativeElement;
    this.render.addClass(prevButton, 'not-clickable');
    this.render.addClass(nextButton, 'not-clickable');
  }

  onColorSelect(idx: number): void {
    const item = this.detailsService.getProductDetails();
    if (item instanceof CustomError) {
      const error = { ...item };
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
      this.customErrorsArr = [...this.customErrorsArr, { ...error }];
      return;
    }
    const { altImages } = item;
    this.selectedImgUrl = altImages[idx];
    if (this.selectedImageIdx !== null && (idx + 1 > this.selectedImageIdx)) {
      this.animationDirection = 'left';
      this.triggerCarouselAnimation(idx + 1);
    } else {
      this.animationDirection = 'right';
      this.triggerCarouselAnimation(idx + 1);
    }
  }

  trackByUrl(_: number, imgUrl: string): string {
    // console.log(url);
    return imgUrl;
  }

  onAddToCart(): void {
    if (this.form.invalid) {
      // console.log('Invalid FORM!');
      return;
    }

    const item = this.detailsService.getProductDetails();
    if (item instanceof CustomError) {
      const error = { ...item };
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
      this.customErrorsArr = [...this.customErrorsArr, { ...error }];
      return;
    }
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price } = this.itemCtrlsGr.value as CartItem;
    const product = selectedQuantity * price;
    this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, product, checked: false });
    this.itemCtrlsGr.reset({ ...item, selectedColor: '', selectedQuantity: '', selectedSize: '' });
    this.selectedImgUrl = image
    this.incrementCartItemsCounter();
    this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
  }

  incrementCartItemsCounter() {
    this.cartItemsCounter++;
  }

  onScrollTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  onDelete(): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        this.animationService.disableProductDetailsCarouselMoveAnimation();
        this.itemState = 'delete';
      },
      () => { return; }
    );
  }
  private deleteItem(): void {
    const item = this.detailsService.getProductDetails();
    if (item instanceof CustomError) {
      this.itemState = 'static';
      const error = { ...item };
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
      this.customErrorsArr = [...this.customErrorsArr, { ...error }];
      return;
    }
    this.loading = true;
    const { _id, cat, subCat } = item;
    const deleteSub = this.catalogManagerService.deleteItem(subCat, _id)
      .pipe(
        catchError(err => {
          this.loading = false;
          this.itemState = 'static';
          const errMsg: string = err.error.message;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          this.toastrMessageHandler.showError(errMsg);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.toastrMessageHandler.showInfo();
        this.animationService.disableProductDetailsCarouselMoveAnimation();
        this.router.navigate([`/catalog/${cat}/${subCat}`]);
      });
    this.unsubscriptionArray.push(deleteSub);
  }

  onItemDeleteAnimation(e: AnimationEvent) {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done') {
      if (e.fromState === 'static' && e.toState === 'delete') {
        this.deleteItem();
      } else if (e.fromState === 'void' && e.toState === 'static') {
        this.animationService.enableProductDetailsCarouselMoveAnimation();
      }

    }
  }

  onNavigateToCart(e: Event, route: string): void {
    e.preventDefault();
    this.animationService.disableDetailsAnimations();
    this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
      .subscribe(
        () => this.ngZone.run(
          () => this.router.navigate([route])
        ));
  }

  onEdit(): void {
    this.animationService.disableDetailsAnimations();
    this.confirmService.showConfirm('Edit this item?',
      () => {
        const item = this.detailsService.getProductDetails();
        if (item instanceof CustomError) {
          const error = { ...item };
          this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
          this.customErrorsArr = [...this.customErrorsArr, { ...error }];
          return;
        }
        this.catalogManagerService.setCatalogItemToEdit({ ...item });
        this.router.navigate(['/edit-product']);
      },
      () => { return; }
    );
  }

  private populateForm(): void {
    const item = this.detailsService.getProductDetails();
    if (item instanceof CustomError) {
      const error = { ...item };
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { ...error }]);
      this.customErrorsArr = [...this.customErrorsArr, { ...error }];
      return;
    }
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    this.itemCtrlsGr.patchValue({
      _ownerId,
      _id,
      _createdOn,
      image,
      altImages,
      cat,
      subCat,
      description,
      size,
      color,
      brand,
      quantity,
      price,
    });
    this.itemCtrlsGr.reset({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price, selectedColor: '', selectedQuantity: '', selectedSize: '' });
    this.selectedImgUrl = image;
  }

}
