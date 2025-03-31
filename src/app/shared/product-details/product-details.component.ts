import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AnimationEvent } from '@angular/animations';
import { EMPTY, Observable, Subscription, catchError, of } from 'rxjs';

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
    private route: ActivatedRoute,
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
    private changeDetector: ChangeDetectorRef,
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
  get selectedColor() {
    return this.itemCtrlsGr.get("selectedColor");
  }
  get selectedSize() {
    return this.itemCtrlsGr.get("selectedSize");
  }
  get selectedQuantity() {
    return this.itemCtrlsGr.get("selectedQuantity");
  }

  ngOnInit(): void {
    console.log('Details Page INITIALIZED!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    const regExp = /^\/catalog\/[a-z]+_?[a-z]+\/[a-z]+_?[a-z]+/g;
    const match: string[] | null = this.router.url.match(regExp);
    // console.log(this.router.url);
    // console.log(match);
    let url = '';
    if (match) {
      url = match[0].split('/')[3];
      // console.log(url);
    }
    const { id } = this.route.snapshot.params;
    // console.log(id);

    const detailsSub = this.detailsService.fetchProductDetails(url, id)
      .pipe(
        catchError(err => {
          if (err.status === 404) {
            return of(EMPTY);
          }
          return of(err);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (res instanceof Observable) {
          // console.log(res instanceof Observable);
          this.router.navigate(['**']);
        }
        if (res instanceof HttpErrorResponse) {
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
          return;
        }
        const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = res as Item;
        this.item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price };
        this.carouselImages = [image, ...altImages];
        this.detailsService.setProductDetails({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price });
        this.populateForm();
        this.animationService.enableProductDetailsDeleteAnimation();
        this.animationService.enableCarouselMoveAnimation();
      });
    const detailsDeleteAnimationStateSub = this.animationService.getProductDetailsDeleteAnimationState()
      .subscribe(state => {
        this.detailsDeleteAnimationDisabled = state;
        this.changeDetector.detectChanges();
      });
    const carouselMoveAnimationStateSub = this.animationService.getCarouselMoveAnimationState()
      .subscribe(state => {
        this.carouselMoveAnimationDisabled = state;
        this.changeDetector.detectChanges();
      });
    this.unsubscriptionArray.push(detailsSub, detailsDeleteAnimationStateSub, carouselMoveAnimationStateSub);
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
  onCarouselMoveAnimation(e: AnimationEvent) {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done' && this.pendingIndex !== null) {
      this.enableCarouselButtons();
      this.updateSelectedImageIdx();
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

  onColorselect(idx: number): void {
    try {
      const { altImages } = this.detailsAvailability();
      this.selectedImgUrl = altImages[idx];
      if (this.selectedImageIdx !== null && (idx + 1 > this.selectedImageIdx)) {
        this.animationDirection = 'left';
        this.triggerCarouselAnimation(idx + 1);
      } else {
        this.animationDirection = 'right';
        this.triggerCarouselAnimation(idx + 1);
      }
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
  }

  trackByUrl(_: number, imgUrl: string): string {
    // console.log(url);
    return imgUrl;
  }

  onAddToCart(): void {
    if (this.form.invalid) {
      console.log('Invalid FORM!');
      return;
    }

    try {
      const item = this.detailsAvailability();
      const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price } = this.itemCtrlsGr.value as CartItem;
      const product = selectedQuantity * price;
      this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, product, checked: false });
      this.itemCtrlsGr.reset({ ...item, selectedColor: '', selectedQuantity: '', selectedSize: '' });
      this.selectedImgUrl = image
      this.incrementCartItemsCounter();
      this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
  }

  incrementCartItemsCounter() {
    this.cartItemsCounter++;
  }

  onChangeDetails() {
    this.loading = true;
    const detailsSub = this.detailsService.fetchProductDetails()
      .pipe(
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (details) => {
            this.loading = false;
            this.item = { ...details };
            const { image, altImages } = details;
            this.carouselImages = [image, ...altImages];
            this.selectedImageIdx = 0;
            this.detailsService.setProductDetails({ ...details });
            this.populateForm();
            this.animationService.enableProductDetailsDeleteAnimation();
            this.animationService.enableCarouselMoveAnimation();
          },
          error: (err) => {
            this.loading = false;
            const errMsg: string = err.error.message;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            this.toastrMessageHandler.showError(errMsg);
          }
        }
      );
    this.unsubscriptionArray.push(detailsSub);
  }

  onScrollTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  onDelete(): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        this.animationService.disableCarouselMoveAnimation();
        this.itemState = 'delete';
      },
      () => { return; }
    );
  }
  private deleteItem(): void {
    try {
      const { _id, cat, subCat } = this.detailsAvailability();
      this.loading = true;
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
          this.animationService.disableCarouselMoveAnimation();
          this.router.navigate([`/catalog/${cat}/${subCat}`]);
        });
      this.unsubscriptionArray.push(deleteSub);
    } catch (err) {
      this.itemState = 'static';
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
  }

  onItemDeleteAnimation(e: AnimationEvent) {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done' && e.toState === 'delete') {
      this.deleteItem();
    } else if (e.phaseName === 'done' && e.toState === 'static') {
      this.animationService.enableCarouselMoveAnimation();
    }
  }

  onNavigateToCart(e: Event, route: string): void {
    e.preventDefault();
    this.animationService.disableCarouselMoveAnimation();
    this.router.navigate([route]);
  }

  onEdit(): void {
    this.animationService.disableCarouselMoveAnimation();
    this.confirmService.showConfirm('Edit this item?',
      () => {
        try {
          const item = this.detailsAvailability();
          this.catalogManagerService.setCatalogItemToEdit({ ...item });
          this.router.navigate(['/edit-product']);
        } catch (err) {
          const { name, message, isUserError } = err as CustomError;
          this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
          this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
        }
      },
      () => { return; }
    );
  }

  private detailsAvailability() {
    if (this.item === null) {
      const error: CustomError = {
        name: 'Item Error',
        message: 'Item is null!',
        isUserError: false,
      };
      throw error;
    }
    return this.item as Item;
  }

  private populateForm(): void {
    try {
      const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.detailsAvailability();
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
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }

  }

}
