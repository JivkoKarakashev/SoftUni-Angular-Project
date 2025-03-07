import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AnimationEvent } from '@angular/animations';
import { EMPTY, Observable, Subscription, catchError, switchMap, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, Item, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { SwimSurfService } from './swim-surf.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { NgConfirmService } from 'ng-confirm-box';
import { PaginationConfig, PaginationService, paginationConfigInit } from 'src/app/shared/utils/pagination.service';
import { CatalogFilters, Color, FilterCatalogDataService, filtersInit, priceFltrInit } from 'src/app/shared/utils/filter-catalog-data.service';
import { InvertColorService } from 'src/app/shared/utils/invert-color.service';
import { AddToCartBtnAnimationState, CatalogItemAnimationState, addToCartBtnAnimation, catalogItemDelAnimation, catalogItemsEnterLeaveAnimation } from 'src/app/shared/animation-service/animations/catalog-items.animation';
import { AnimationService } from 'src/app/shared/animation-service/animation.service';

@Component({
  selector: 'app-swim-surf',
  templateUrl: './swim-surf.component.html',
  styleUrls: ['./swim-surf.component.css'],
  animations: [
    catalogItemDelAnimation,
    catalogItemsEnterLeaveAnimation,
    addToCartBtnAnimation
  ]
})
export class SwimSurfComponent implements OnInit, AfterViewInit, OnDestroy {

  public listItems: ListItem[] = [];
  public filteredItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public showScrollUpBtn = false;
  public sidebarState: 'open' | 'closed' = 'open';
  public btnAnimStatesArr: AddToCartBtnAnimationState[] = [];
  public catalogItmAnimDisabled = false;
  public catalogItmDelAnimStatesArr: CatalogItemAnimationState[] = [];

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

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private swim_surfService: SwimSurfService,
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
    private changeDetector: ChangeDetectorRef,
    private animationService: AnimationService
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
    this.animationService.enableCatalogItemEnterLeaveAnimation();
    this.selected.page = Number(this.activatedRoute.snapshot.queryParamMap.get('page')) || 1;
    this.selected.pageSize = Number(this.activatedRoute.snapshot.queryParamMap.get('pageSize')) || 2;
    this.updateQueryParams();
    /////////////////////////////////////////////
    /////////////////////////////////////////////
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
    const animationDisabledStateSub = this.animationService.getCatalogItemAnimationState()
      .subscribe(state => {
        // console.log(state);
        this.catalogItmAnimDisabled = state;
      });
    this.unsubscriptionArray.push(fetchCatalogDataSub, animationDisabledStateSub);
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
    this.animationService.disableCatalogItemEnterLeaveAnimation();
    setTimeout(() => {
      this.router.navigate([route]);
    }, 10);
  }

  onAddToCart(i: number): void {
    this.btnAnimStatesArr[i] = { ...this.btnAnimStatesArr, animateState: 'animate', btnText: '\u2713' };
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.listItems[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    this.cartService.addCartItem(newCartItem);
  }

  setAnimationStates(): void {
    this.btnAnimStatesArr = Array.from({ length: this.filteredItems.length }, () => ({ animateState: 'static', btnText: 'Add to Cart' }) as AddToCartBtnAnimationState);
    this.catalogItmDelAnimStatesArr = Array.from({ length: this.filteredItems.length }, () => 'static' as CatalogItemAnimationState);
  }

  onItemEnteringOrLeavingAnimation(e: AnimationEvent): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start') {
      this.render.setStyle(e.element, 'pointer-events', 'none');
    } else if (e.phaseName === 'done') {
      this.render.removeStyle(e.element, 'pointer-events');
    }
  }

  onItemDeletionAnimation(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done') {
      if (e.fromState === 'static' && e.toState === 'delete' && i !== undefined) {
        const deleteSub = this.deleteItem(i).subscribe();
        this.unsubscriptionArray.push(deleteSub);
      }
    }
  }

  onAddToCartBtnAnimate(e: AnimationEvent, i: number): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start' && e.fromState === 'static' && e.toState === 'animate') {
      this.render.setStyle(e.element, 'pointer-events', 'none');
    } else if (e.phaseName === 'done' && e.fromState === 'static' && e.toState === 'animate') {
      this.render.setStyle(e.element, 'display', 'none');
      this.btnAnimStatesArr[i] = { ...this.btnAnimStatesArr[i], animateState: 'static', btnText: 'Add to Cart' };
      this.cartItemsCounter++;
      this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
      const idx = this.listItems.findIndex(itm => itm._id == this.listItems[i]._id);
      this.listItems[idx].inCart = true;
      this.filteredItems[idx].inCart = true;
    }

  }

  onScrollTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  onDelete(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        this.catalogItmDelAnimStatesArr[i] = 'delete';
      },
      () => { return; }
    );
  }

  private deleteItem(i: number): Observable<Item[]> {
    this.loading = true;
    const { _id, subCat } = this.listItems[i];
    return this.catalogManagerService.deleteItem(subCat, _id)
      .pipe(
        catchError(err => {
          this.loading = false;
          this.catalogItmDelAnimStatesArr[i] = 'static';
          const errMsg: string = err.error.message;
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          this.toastrMessageHandler.showError(errMsg);
          return EMPTY;
        }
        ),
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
    const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
    this.unsubscriptionArray.push(fetchCatalogDataSub);
  }

  onPageSelect(selectedPage: string): void {
    this.selected.page = Number(selectedPage);
    const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
    this.unsubscriptionArray.push(fetchCatalogDataSub);
  }

  onPageSizeSelect(selectedPageSize: string): void {
    this.selected.pageSize = Number(selectedPageSize);
    const fetchCatalogDataSub = this.fetchCatalogData().subscribe();
    this.unsubscriptionArray.push(fetchCatalogDataSub);
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
    return this.swim_surfService.getCollectionSize()
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
          return this.swim_surfService.getSwimSurfByPage(this.paginationConfig.skipSizeReq, this.paginationConfig.pageSizeReq)
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
                const fromPrCurr = this.priceFilterOptions[0];
                const toPrCurr = this.priceFilterOptions[this.priceFilterOptions.length - 1];
                const toPrMin = this.priceFilterOptions[0];
                const toPrMax = this.priceFilterOptions[this.priceFilterOptions.length - 1];
                this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
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
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onSizeFilterClear(): void {
    this.sizeBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearSizeFilter();
    // console.log(this.filters.size);
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onColorFilterChange(i: number): void {
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
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onColorFilterClear(): void {
    this.colorBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearColorFilter();
    // console.log(this.filters.color);
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onBrandFilterChange(i: number): void {
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
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onBrandFilterClear(): void {
    this.brandBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearBrandFilter();
    // console.log(this.filters.brand);
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
  }

  onPriceSliderChange(): void {
    const fromPriceSliderEl = this.fromPriceSlider.nativeElement;
    const toPriceSliderEl = this.toPriceSlider.nativeElement;

    if (fromPriceSliderEl && toPriceSliderEl) {
      const fromPrCurr = (Number(fromPriceSliderEl.value) >= Number(toPriceSliderEl.value)) ? Number(toPriceSliderEl.value) : Number(fromPriceSliderEl.value);
      const toPrCurr = (Number(toPriceSliderEl.value) <= Number(fromPriceSliderEl.value)) ? Number(fromPriceSliderEl.value) : Number(toPriceSliderEl.value);
      const toPrMin = Number(toPriceSliderEl.min);
      const toPrMax = Number(toPriceSliderEl.max);
      this.filters.price = {
        from: fromPrCurr,
        to: toPrCurr
      }
      // console.log(this.filters.price);
      this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
      this.setAnimationStates();
      this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
      this.priceInputCtrl(fromPrCurr, toPrCurr);
    }
  }

  private priceSliderCtrl(fromPrCurr: number, toPrCurr: number): void {
    const toPrMin = this.priceFilterOptions[0];
    const toPrMax = this.priceFilterOptions[this.priceFilterOptions.length - 1];
    this.render.setProperty(this.fromPriceSlider.nativeElement, 'value', fromPrCurr);
    this.render.setProperty(this.toPriceSlider.nativeElement, 'value', toPrCurr);
    this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
  }

  private fillSlider(fromPrCurr: number, toPrCurr: number, toPrMin: number, toPrMax: number): void {
    const sliderColor = '#C6C6C6';
    const rangeColor = '#387bbe';

    const rangeDist = toPrMax - toPrMin;
    const fromPos = fromPrCurr - toPrMin;
    const toPos = toPrCurr - toPrMin;
    // console.log(fromPrCurr, toPrCurr);
    // console.log(rangeDist, fromPos, toPos);
    if (!this.toPriceSlider) {
      this.changeDetector.detectChanges();
    }

    this.render.setStyle(this.toPriceSlider.nativeElement, 'background', `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPos) / (rangeDist) * 100}%,
      ${rangeColor} ${((fromPos) / (rangeDist)) * 100}%,
      ${rangeColor} ${(toPos) / (rangeDist) * 100}%, 
      ${sliderColor} ${(toPos) / (rangeDist) * 100}%, 
      ${sliderColor} 100%)`);
  }

  onPriceInputChange(): void {
    const fromPriceInputEl = this.fromPriceInput.nativeElement;
    const toPriceInputEl = this.toPriceInput.nativeElement;
    const fromPrCurr = Number(fromPriceInputEl.value);
    const toPrCurr = Number(toPriceInputEl.value);
    this.filters.price = {
      from: fromPrCurr,
      to: toPrCurr
    }
    // console.log(this.filters.price);
    this.render.setAttribute(fromPriceInputEl, 'max', String(toPrCurr));
    this.render.setAttribute(toPriceInputEl, 'min', String(fromPrCurr));
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
    this.priceSliderCtrl(fromPrCurr, toPrCurr);
    // console.log(fromPrCurr, toPrCurr);
  }

  private priceInputCtrl(fromPrCurr: number, toPrCurr: number): void {
    // this.frompriceinput.nativeElement.value = String(fromPrCurr);
    // this.topriceinput.nativeElement.value = String(toPrCurr);
    this.render.setProperty(this.fromPriceInput.nativeElement, 'value', String(fromPrCurr));
    this.render.setProperty(this.toPriceInput.nativeElement, 'value', String(toPrCurr));
    // console.log(this.fromPriceInput.nativeElement.value, this.toPriceInput.nativeElement.value);
  }

  onPriceFilterClear(): void {
    const fromPrCurr = this.priceFilterOptions[0];
    const toPrCurr = this.priceFilterOptions[this.priceFilterOptions.length - 1];
    this.filters.price = { ...priceFltrInit };
    this.filteredItems = this.filterService.accumulativeFilter(this.filters, this.listItems);
    this.setAnimationStates();
    this.priceSliderCtrl(fromPrCurr, toPrCurr);
    this.priceInputCtrl(fromPrCurr, toPrCurr);
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
