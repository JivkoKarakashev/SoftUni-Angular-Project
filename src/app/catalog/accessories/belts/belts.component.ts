import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AnimationEvent } from '@angular/animations';
import { EMPTY, Observable, Subscription, catchError, switchMap, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, Item, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { BeltsService } from './belts.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { NgConfirmService } from 'ng-confirm-box';
import { PaginationConfig, PaginationService, paginationConfigInit } from 'src/app/shared/utils/pagination.service';
import { CatalogFilters, Color, FilterCatalogDataService, filtersInit, priceFltrInit } from 'src/app/shared/utils/filter-catalog-data.service';
import { CatalogPriceFilterSliderParams, catalogPriceFilterSliderInitParams } from 'src/app/types/catalog';
import { InvertColorService } from 'src/app/shared/utils/invert-color.service';
import { AddToCartButtonAnimationState, CatalogItemAnimationState, addToCartButtonAnimation, catalogItemDeleteAnimation, catalogItemEnterLeaveAnimation } from 'src/app/shared/animation-service/animations/catalog-items.animation';
import { AnimationService } from 'src/app/shared/animation-service/animation.service';
import { NgZoneOnStableEventProviderService } from 'src/app/shared/utils/ng-zone-on-stable-event-provider.service';

@Component({
  selector: 'app-belts',
  templateUrl: './belts.component.html',
  styleUrls: ['./belts.component.css'],
  animations: [
    catalogItemDeleteAnimation,
    catalogItemEnterLeaveAnimation,
    addToCartButtonAnimation
  ]
})
export class BeltsComponent implements OnInit, AfterViewInit, OnDestroy {

  public listItems: ListItem[] = [];
  public filteredItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public showScrollUpBtn = false;
  public sidebarState: 'open' | 'closed' = 'open';
  public addToCartButtonAnimationStateArr: AddToCartButtonAnimationState[] = [];
  public catalogItemEnterLeaveAnimationState: CatalogItemAnimationState = 'static';
  public catalogItemEnterLeaveAnimationDisabled = false;
  public catalogItemDeleteAnimationDisabled = true;
  public catalogItemDeleteAnimationStateArr: CatalogItemAnimationState[] = [];
  public filterEventsDisabled = false;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  public paginationConfig: PaginationConfig = { ...paginationConfigInit };
  public pageOptionArr: number[] = [];
  public pageSizeOptionArr: number[] = [];
  public selected = {
    page: 0,
    pageSize: 0
  }

  public filters: CatalogFilters = { ...filtersInit };
  public sizeFilterOptions: (number | string)[] = [];
  public colorFilterOptions: Array<Color> = [];
  public brandFilterOptions: Array<string> = [];
  public priceFilterOptions: Array<number> = [];
  private priceSliderParams: CatalogPriceFilterSliderParams = { ...catalogPriceFilterSliderInitParams };

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private beltsService: BeltsService,
    private errorsService: ErrorsService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService,
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paginationService: PaginationService,
    private render: Renderer2,
    private filterService: FilterCatalogDataService,
    private invertColorService: InvertColorService,
    private viewportScroller: ViewportScroller,
    private animationService: AnimationService,
    private ngZone: NgZone,
    private ngZoneOnStableEventProviderService: NgZoneOnStableEventProviderService
  ) { }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef<HTMLSpanElement>>;

  @ViewChildren('sizeBtns') private sizeBtns!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('colorBtns') private colorBtns!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('brandBtns') private brandBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  @ViewChild('fromPriceSlider') private fromPriceSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('toPriceSlider') private toPriceSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('fromPriceInput') private fromPriceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('toPriceInput') private toPriceInput!: ElementRef<HTMLInputElement>;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const [, yPos] = this.viewportScroller.getScrollPosition();
    if (yPos > 350 && !this.showScrollUpBtn) {
      this.showScrollUpBtn = true;
    } else if (yPos <= 350 && this.showScrollUpBtn) {
      this.showScrollUpBtn = false;
    }
  }

  ngOnInit(): void {
    this.animationService.enableCatalogItemAnimations();
    this.selected.page = Number(this.activatedRoute.snapshot.queryParamMap.get('page')) || 1;
    this.selected.pageSize = Number(this.activatedRoute.snapshot.queryParamMap.get('pageSize')) || 2;
    this.updateQueryParams();
    /////////////////////////////////////////////
    /////////////////////////////////////////////
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
    const enterLeaveAnimationStateSub = this.animationService
      .getCatalogItemEnterLeaveAnimationState()
      .subscribe(state => this.catalogItemEnterLeaveAnimationDisabled = state);
    const deleteAnimationStateSub = this.animationService
      .getCatalogItemDeleteAnimationState()
      .subscribe(state => this.catalogItemDeleteAnimationDisabled = state);
    this.unsubscriptionArray.push(fetchCatalogDataSub, enterLeaveAnimationStateSub, deleteAnimationStateSub);
    this.updateQueryParams();
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
    // console.log('UnsubArray = 1 - infinity');
  }

  onNavigate(e: Event, route: string): void {
    e.preventDefault();
    this.animationService.disableCatalogItemAnimations();
    this.router.navigate([route]);
  }

  onAddToCart(i: number): void {
    this.addToCartButtonAnimationStateArr[i] = { ...this.addToCartButtonAnimationStateArr, animateState: 'animate', btnText: '\u2713' };
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.filteredItems[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    this.cartService.addCartItem(newCartItem);
  }

  setAnimationStates(): void {
    this.addToCartButtonAnimationStateArr = Array.from({ length: this.filteredItems.length }, () => ({ animateState: 'static', btnText: 'Add to Cart' }) as AddToCartButtonAnimationState);
    this.catalogItemDeleteAnimationStateArr = Array.from({ length: this.filteredItems.length }, () => 'static' as CatalogItemAnimationState);
  }

  onItemEnterOrLeaveAnimation(e: AnimationEvent): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start') {
      this.render.setStyle(e.element, 'pointer-events', 'none');
    } else if (e.phaseName === 'done') {
      this.render.removeStyle(e.element, 'pointer-events');
      if (e.fromState === 'filter' && e.toState === 'static') {
        this.filterEventsDisabled = false;
      } else if (e.fromState === 'static' && e.toState === 'leave') {
        this.catalogItemEnterLeaveAnimationState = 'static';
        const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
        this.unsubscriptionArray.push(fetchCatalogDataSub);
      } else if (e.fromState === 'static' && e.toState === 'filter') {
        this.catalogItemEnterLeaveAnimationState = 'static';
        this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
        this.setAnimationStates();
      }
    }
  }

  onItemDeleteAnimation(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done') {
      if (e.fromState === 'static' && e.toState === 'delete' && i !== undefined) {
        this.render.setStyle(e.element, 'opacity', 0);
        const deleteSub = this.deleteItem(i).subscribe();
        this.unsubscriptionArray.push(deleteSub);
      }
    }
  }

  onAddToCartButtonAnimation(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start' && e.fromState === 'static' && e.toState === 'animate') {
      this.render.setStyle(e.element, 'pointer-events', 'none');
    } else if (e.phaseName === 'done' && e.fromState === 'static' && e.toState === 'animate') {
      this.render.setStyle(e.element, 'display', 'none');
      this.addToCartButtonAnimationStateArr[i] = { ...this.addToCartButtonAnimationStateArr[i], animateState: 'static', btnText: 'Add to Cart' };
      this.cartItemsCounter++;
      this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
      const idx = this.listItems.findIndex(itm => itm._id == this.filteredItems[i]._id);
      this.listItems[idx] = { ...this.listItems[idx], inCart: true };
      this.filteredItems[i] = { ...this.filteredItems[i], inCart: true };
    }

  }

  onScrollTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  onDelete(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        this.catalogItemDeleteAnimationStateArr[i] = 'delete';
      },
      () => { return; }
    );
  }

  private deleteItem(i: number): Observable<Item[]> {
    this.loading = true;
    const { _id, subCat } = this.filteredItems[i];
    return this.catalogManagerService.deleteItem(subCat, _id)
      .pipe(
        catchError(err => {
          this.loading = false;
          this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
            .subscribe(
              () => this.ngZone.run(
                () => {
                  this.priceSliderCtrl();
                  this.priceInputCtrl();
                }
              )
            );
          this.catalogItemDeleteAnimationStateArr[i] = 'static';
          const errMsg: string = err.error.message;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          this.toastrMessageHandler.showError(errMsg);
          return EMPTY;
        }),
        switchMap(() => {
          return this.fetchCatalogData()
            .pipe(
              tap(() => {
                this.loading = false;
                this.toastrMessageHandler.showInfo()
              })
            );
        }),
      );
  }

  onEdit(i: number): void {
    this.confirmService.showConfirm('Edit this item?',
      () => {
        this.catalogManagerService.setCatalogItemToEdit({ ...this.filteredItems[i] });
        this.router.navigate(['/edit-product']);
      },
      () => { return; }
    );
  }

  onPageChange(selectedPage: number): void {
    this.selected.page = selectedPage || 1;
    this.catalogItemEnterLeaveAnimationState = 'leave';
    this.filteredItems = [];
  }

  onPageSelect(selectedPage: string): void {
    this.selected.page = Number(selectedPage);
    this.catalogItemEnterLeaveAnimationState = 'leave';
    this.filteredItems = [];
  }

  onPageSizeSelect(selectedPageSize: string): void {
    this.selected.pageSize = Number(selectedPageSize);
    this.catalogItemEnterLeaveAnimationState = 'leave';
    this.filteredItems = [];
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.selected.page === 0 ? null : this.selected.page,
        pageSize: this.selected.pageSize === 0 ? null : this.selected.pageSize
      },
      queryParamsHandling: 'merge',
    });
  }

  private fetchCatalogData(): Observable<Item[]> {
    this.loading = true;
    return this.beltsService.getCollectionSize()
      .pipe(
        catchError(err => {
          this.loading = false;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          return EMPTY;
        }),
        switchMap(collSize => {
          if (collSize === 0) {
            this.loading = false;
            return EMPTY;
          }
          this.pageSizeOptionArr = Array.from({ length: collSize }, (_, i) => i + 1);
          this.paginationConfig = this.paginationService.paginationConfigCalc(collSize, this.selected.pageSize, this.selected.page);
          this.selected.page = this.paginationConfig.selectedPage;
          this.pageOptionArr = Array.from({ length: this.paginationConfig.totalPages }, (_, i) => i + 1);
          this.updateQueryParams();
          ///////////////////////////////////////
          // console.log(this.paginationConfig);/
          // console.log(this.currentPage);//////
          ///////////////////////////////////////
          return this.beltsService.getBeltsByPage(this.paginationConfig.skipSizeReq, this.paginationConfig.pageSizeReq)
            .pipe(
              catchError(err => {
                this.loading = false;
                this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
                return EMPTY;
              }),
              tap(itms => {
                this.loading = false;
                // console.log(itms);
                this.resetFilters();
                // console.log(this.filters);
                this.cartItms = [...this.cartStateMgmnt.getCartItems()];
                this.cartItemsCounter = this.cartItms.length;
                this.listItems = this.checkForInCartAlready.check([itms], this.cartItms);
                this.filteredItems = [...this.listItems];
                this.setAnimationStates();
                this.sizeFilterOptions = Array.from(new Set(itms.map(itm => itm.size).flat(1).sort((a, b) => {
                  if (typeof (a) === 'number' && typeof (b) === 'number') {
                    return a - b;
                  } else {
                    return String(a).localeCompare(String(b));
                  }
                })));
                const colorOpts = Array.from(new Set(itms.map(itm => itm.color).flat(1).sort((a, b) => a.localeCompare(b))));
                this.colorFilterOptions = [];
                colorOpts.forEach(col => {
                  const hexColor = this.invertColorService.nameToHex(col);
                  const invertedColor = this.invertColorService.invertColor(hexColor);
                  // console.log(hexColor);
                  if (invertedColor) {
                    this.colorFilterOptions.push({ hex: hexColor, hexInverted: invertedColor, name: col });
                  }
                });
                this.brandFilterOptions = Array.from(new Set(itms.map(itm => itm.brand).sort((a, b) => a.localeCompare(b))));
                this.priceFilterOptions = Array.from(new Set(itms.map((itm, i) => (i !== itms.length - 1) ? Math.trunc(itm.price) : Math.ceil(itm.price)).sort((a, b) => a - b)));
                const fromPriceCurrV = this.priceFilterOptions[0];
                const toPriceCurrV = this.priceFilterOptions[this.priceFilterOptions.length - 1];
                const toPriceMinV = this.priceFilterOptions[0];
                const toPriceMaxV = this.priceFilterOptions[this.priceFilterOptions.length - 1];
                this.setPriceSliderParams({ fromPriceCurrV, toPriceCurrV, toPriceMinV, toPriceMaxV });
                this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
                  .subscribe(
                    () => this.ngZone.run(
                      () => this.fillSlider()
                    )
                  );
                // console.log(this.listItems);
              })
            );
        }),
      );
  }
  /////////////////////////////////////////////////////////
  // <-------------------- FILTERS --------------------> //
  /////////////////////////////////////////////////////////

  onSidebarToggle(): void {
    this.sidebarState === 'open' ? this.sidebarState = 'closed' : this.sidebarState = 'open';
  }

  onSizeFilterChange(i: number): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const selectedSize = this.sizeFilterOptions[i];
    const sizeBtnEl = this.sizeBtns.get(i)?.nativeElement;
    if (!sizeBtnEl?.classList.contains('active')) {
      this.render.addClass(sizeBtnEl, 'active');
      this.filters.size.push(selectedSize);
    } else {
      const newSizeFilter = this.filters.size.filter(size => size != selectedSize);
      this.filters.size = [...newSizeFilter];
      this.render.removeClass(sizeBtnEl, 'active');
    }
    // console.log(this.filters.size);
  }

  onSizeFilterClear(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    this.sizeBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearSizeFilter();
    // console.log(this.filters.size);
  }

  onColorFilterChange(i: number): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const selectedColor = this.colorFilterOptions[i];
    const colorBtnEl = this.colorBtns.get(i)?.nativeElement;
    if (!colorBtnEl?.classList.contains('active')) {
      this.render.addClass(colorBtnEl, 'active');
      this.filters.color.push(selectedColor);
    } else {
      const newColorFilter = this.filters.color.filter(color => color.name != selectedColor.name);
      this.filters.color = [...newColorFilter];
      this.render.removeClass(colorBtnEl, 'active');
    }
    // console.log(this.filters.color.map(col => col.bkgnd));
  }

  onColorFilterClear(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    this.colorBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearColorFilter();
    // console.log(this.filters.color);
  }

  onBrandFilterChange(i: number): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const selectedBrand = this.brandFilterOptions[i];
    const brandBtnEl = this.brandBtns.get(i)?.nativeElement;
    if (!brandBtnEl?.classList.contains('active')) {
      this.render.addClass(brandBtnEl, 'active');
      this.filters.brand.push(selectedBrand);
    } else {
      const newBrandFilter = this.filters.brand.filter(brand => brand != selectedBrand);
      this.filters.brand = [...newBrandFilter];
      this.render.removeClass(brandBtnEl, 'active');
    }
    // console.log(this.filters.brand);
  }

  onBrandFilterClear(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    this.brandBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearBrandFilter();
    // console.log(this.filters.brand);
  }

  private getPriceSliderParams(): CatalogPriceFilterSliderParams {
    return this.priceSliderParams;
  }

  private setPriceSliderParams(params: CatalogPriceFilterSliderParams): void {
    this.priceSliderParams = params;
  }

  onPriceSliderChange(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const fromPriceSliderEl = this.fromPriceSlider.nativeElement;
    const toPriceSliderEl = this.toPriceSlider.nativeElement;

    const fromPriceCurrV = (Number(fromPriceSliderEl.value) >= Number(toPriceSliderEl.value)) ? Number(toPriceSliderEl.value) : Number(fromPriceSliderEl.value);
    const toPriceCurrV = (Number(toPriceSliderEl.value) <= Number(fromPriceSliderEl.value)) ? Number(fromPriceSliderEl.value) : Number(toPriceSliderEl.value);
    const toPriceMinV = Number(toPriceSliderEl.min);
    const toPriceMaxV = Number(toPriceSliderEl.max);
    this.filters.price = {
      from: fromPriceCurrV,
      to: toPriceCurrV
    }
    // console.log(this.filters.price);
    this.setPriceSliderParams({ fromPriceCurrV, toPriceCurrV, toPriceMinV, toPriceMaxV });
    this.priceSliderCtrl();
    this.priceInputCtrl();
  }

  private priceSliderCtrl(): void {
    const { fromPriceCurrV, toPriceCurrV } = this.getPriceSliderParams();
    this.render.setProperty(this.fromPriceSlider.nativeElement, 'value', fromPriceCurrV);
    this.render.setProperty(this.toPriceSlider.nativeElement, 'value', toPriceCurrV);
    this.fillSlider();
  }

  private fillSlider(): void {
    const { fromPriceCurrV, toPriceCurrV, toPriceMinV, toPriceMaxV } = this.priceSliderParams;
    const sliderColor = '#C6C6C6';
    const rangeColor = '#387bbe';

    const rangeDist = toPriceMaxV - toPriceMinV;
    const fromPos = fromPriceCurrV - toPriceMinV;
    const toPos = toPriceCurrV - toPriceMinV;
    // console.log(fromPrCurr, toPrCurr);
    // console.log(rangeDist, fromPos, toPos);
    this.render.setStyle(
      this.toPriceSlider.nativeElement,
      'background',
      `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${(fromPos) / (rangeDist) * 100}%, ${rangeColor} ${((fromPos) / (rangeDist)) * 100}%, ${rangeColor} ${(toPos) / (rangeDist) * 100}%, ${sliderColor} ${(toPos) / (rangeDist) * 100}%, ${sliderColor} 100%)`
    );
  }

  onPriceInputChange(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const fromPriceInputEl = this.fromPriceInput.nativeElement;
    const toPriceInputEl = this.toPriceInput.nativeElement;
    const fromPriceCurrV = Number(fromPriceInputEl.value);
    const toPriceCurrV = Number(toPriceInputEl.value);
    const { toPriceMinV, toPriceMaxV } = this.getPriceSliderParams();
    this.setPriceSliderParams({ fromPriceCurrV, toPriceCurrV, toPriceMinV, toPriceMaxV });
    this.filters.price = {
      from: fromPriceCurrV,
      to: toPriceCurrV
    }
    // console.log(this.filters.price);
    this.render.setAttribute(fromPriceInputEl, 'max', String(toPriceCurrV));
    this.render.setAttribute(toPriceInputEl, 'min', String(fromPriceCurrV));
    this.priceSliderCtrl();
    // console.log(fromPrCurr, toPrCurr);
  }

  private priceInputCtrl(): void {
    const { fromPriceCurrV, toPriceCurrV } = this.getPriceSliderParams();
    this.render.setProperty(this.fromPriceInput.nativeElement, 'value', String(fromPriceCurrV));
    this.render.setProperty(this.toPriceInput.nativeElement, 'value', String(toPriceCurrV));
    // console.log(this.fromPriceInput.nativeElement.value, this.toPriceInput.nativeElement.value);
  }

  onPriceFilterClear(): void {
    this.filterEventsDisabled = true;
    this.catalogItemEnterLeaveAnimationState = 'filter';
    this.filteredItems = [];
    const fromPriceCurrV = this.priceFilterOptions[0];
    const toPriceCurrV = this.priceFilterOptions[this.priceFilterOptions.length - 1];
    const { toPriceMinV, toPriceMaxV } = this.getPriceSliderParams();
    this.setPriceSliderParams({ fromPriceCurrV, toPriceCurrV, toPriceMinV, toPriceMaxV });
    this.filters.price = { ...priceFltrInit };
    this.priceSliderCtrl();
    this.priceInputCtrl();
  }
  ///////////////////////////////////////////
  trackByIdx(idx: number): number {
    // console.log('INDEXED');
    return idx;
  }

  trackById(_: number, item: Item): string {
    // console.log(item._id);
    return item._id;
  }

  private clearFilter = {
    clearSizeFilter: () => this.filters.size = [],
    clearColorFilter: () => this.filters.color = [],
    clearBrandFilter: () => this.filters.brand = []
  }

  private resetFilters() {
    this.clearFilter.clearSizeFilter();
    this.clearFilter.clearColorFilter();
    this.clearFilter.clearBrandFilter();
  }

}
