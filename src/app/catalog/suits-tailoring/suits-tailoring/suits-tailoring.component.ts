import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { EMPTY, Subscription, catchError, of, switchMap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, Item, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { SuitsTailoringService } from './suits-tailoring.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { NgConfirmService } from 'ng-confirm-box';
import { CategoryPaginationConfig, CategoryPaginationService, categoryPaginationConfigInit } from 'src/app/shared/utils/category-pagination.service';
import { CatalogFilters, Color, FilterCatalogDataService, filtersInit, priceFltrInit } from 'src/app/shared/utils/filter-catalog-data.service';
import { InvertColorService } from 'src/app/shared/utils/invert-color.service';

@Component({
  selector: 'app-suits-tailoring',
  templateUrl: './suits-tailoring.component.html',
  styleUrls: ['./suits-tailoring.component.css']
})
export class SuitsTailoringComponent implements OnInit, OnDestroy {

  public listItems: ListItem[] = [];
  public filteredItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public showScrollUpBtn = false;
  public sidebarState: 'open' | 'closed' = 'open';

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  public paginationConfig: CategoryPaginationConfig = { ...categoryPaginationConfigInit };
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
    private suitsTailoringService: SuitsTailoringService,
    private errorsService: ErrorsService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService,
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paginationService: CategoryPaginationService,
    private render: Renderer2,
    private filterService: FilterCatalogDataService,
    private invertColorService: InvertColorService,
    private viewportScroller: ViewportScroller,
    private changeDetector: ChangeDetectorRef
  ) { }

  @ViewChildren('sizeBtns') private sizeBtns!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('colorBtns') private colorBtns!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('brandBtns') private brandBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  @ViewChild('fromPriceSlider') private fromPriceSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('toPriceSlider') private toPriceSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('fromPriceInput') private fromPriceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('toPriceInput') private toPriceInput!: ElementRef<HTMLInputElement>;

  @HostListener('window:scroll')
  onWindowScroll() {
    const [, yPos] = this.viewportScroller.getScrollPosition();
    if (yPos > 350 && !this.showScrollUpBtn) {
      this.showScrollUpBtn = true;
    } else if (yPos <= 350 && this.showScrollUpBtn) {
      this.showScrollUpBtn = false;
    }
  }

  ngOnInit(): void {
    this.selected.page = Number(this.activatedRoute.snapshot.queryParamMap.get('page')) || 1;
    this.selected.pageSize = Number(this.activatedRoute.snapshot.queryParamMap.get('pageSize')) || 2;
    this.updateQueryParams();
    /////////////////////////////////////////////
    /////////////////////////////////////////////
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.cartItms = [...this.cartItms, ...this.cartStateMgmnt.getCartItems()];
    this.cartItemsCounter = this.cartItms.length;
    const categoryUrls = this.suitsTailoringService.getCategoryUrls();
    this.paginationService.setCategoryUrls([...categoryUrls]);
    this.fetchDataSubscription();
    this.updateQueryParams();
  }

  ngOnDestroy(): void {
    this.paginationService.resetCategoryPaginationConfig();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1 - infinity');
  }

  onAddToCart(i: number): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.listItems[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], inCart: true };
    this.filteredItems[idx] = { ...this.filteredItems[idx], inCart: true };
    this.cartService.addCartItem(newCartItem);
    this.cartItemsCounter++;
    this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }

  onScrollTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  onDelete(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        const { _id, subCat } = this.listItems[i];
        const deleteSub = this.catalogManagerService.deleteItem(subCat, _id)
          .pipe(
            catchError(err => { throw err; }),
            switchMap(() => {
              return this.fetchData()
            }),
          )
          .subscribe(
            {
              next: () => {
                this.fetchDataSubscription();
                this.toastrMessageHandler.showInfo();
              },
              error: (err) => {
                const errMsg: string = err.error.message;
                this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
                this.toastrMessageHandler.showError(errMsg);
              }
            }
          );
        this.unsubscriptionArray.push(deleteSub);
      },
      () => { return; }
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

  onPageChange(selectedPage: number) {
    this.selected.page = selectedPage || 1;
    this.fetchDataSubscription();
  }

  onPageSelect(selectedPage: string) {
    this.selected.page = Number(selectedPage);
    this.fetchDataSubscription();
  }

  onPageSizeSelect(selectedPageSize: string) {
    this.selected.pageSize = Number(selectedPageSize);
    this.fetchDataSubscription();
  }

  private updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.selected.page === 0 ? null : this.selected.page,
        pageSize: this.selected.pageSize === 0 ? null : this.selected.pageSize
      },
      queryParamsHandling: 'merge',
    });
  }

  private fetchData() {
    this.loading = true;
    return this.suitsTailoringService.getCollectionComposition()
      .pipe(
        switchMap(compArr => {
          if (compArr.length === 0) {
            this.loading = false;
            return EMPTY;
          }

          this.paginationService.paginationCategoryConfigCalcAndSet(compArr, this.selected.pageSize, this.selected.page);
          this.paginationConfig = this.paginationService.getCategoryPaginationConfig();
          this.pageSizeOptionArr = Array.from({ length: this.paginationConfig.categorySize }, (_, i) => i + 1);
          this.selected.page = this.paginationConfig.selectedPage;
          this.pageOptionArr = Array.from({ length: this.paginationConfig.totalPages }, (_, i) => i + 1);
          this.updateQueryParams();
          // /////////////////////////////
          // console.log(this.paginationConfig);
          // console.log(this.currentPage);
          // /////////////////////////////
          return this.suitsTailoringService.getSuitsTailoringByPage([...this.paginationConfig.subcategoryConfigs]);
        }),
        catchError(err => { return of(err); }),
      )
  }

  private fetchDataSubscription() {
    const fetchDataSub = this.fetchData().subscribe(res => {
      this.loading = false;
      // console.log(res);
      if (res instanceof HttpErrorResponse) {
        this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
        this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
        return;
      }
      this.resetFilters();
      // console.log(this.filters);
      const flattenedListItems = (res as Array<Item[]>).flat(1);
      this.listItems = [...this.checkForInCartAlready.check(res as Array<Item[]>, this.cartItms)];
      this.filteredItems = [...this.listItems];
      this.sizeFilterOptions = [...Array.from(new Set([...(flattenedListItems).map(itm => itm.size).flat(1).sort()]))];
      const colorOpts = [...Array.from(new Set([...(flattenedListItems).map(itm => itm.color).flat(1).sort((a, b) => a.localeCompare(b))]))];
      this.colorFilterOptions = [];
      colorOpts.forEach(col => {
        const hexColor = this.invertColorService.nameToHex(col);
        const invertedColor = this.invertColorService.invertColor(hexColor);
        // console.log(hexColor);
        if (invertedColor) {
          this.colorFilterOptions.push({ hex: hexColor, hexInverted: invertedColor, name: col });
        }
      });
      this.brandFilterOptions = [...Array.from(new Set([...(flattenedListItems).map(itm => itm.brand).sort((a, b) => a.localeCompare(b))]))];
      this.priceFilterOptions = [...Array.from(new Set([...(flattenedListItems).map((itm, i) => (i !== (res as Item[]).length - 1) ? Math.trunc(itm.price) : Math.ceil(itm.price)).sort((a, b) => a - b)]))];
      const fromPrCurr = this.priceFilterOptions[0];
      const toPrCurr = this.priceFilterOptions[this.priceFilterOptions.length - 1];
      const toPrMin = this.priceFilterOptions[0];
      const toPrMax = this.priceFilterOptions[this.priceFilterOptions.length - 1];
      this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
      // console.log(this.listItems);
    });
    this.unsubscriptionArray.push(fetchDataSub);
    return fetchDataSub;
  }
  /////////////////////////////////////////////////////////
  // <-------------------- FILTERS --------------------> //
  /////////////////////////////////////////////////////////

  onSidebarToggle() {
    this.sidebarState === 'open' ? this.sidebarState = 'closed' : this.sidebarState = 'open';
  }

  onSizeFilterChange(i: number) {
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
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
  }

  onSizeFilterClear() {
    this.sizeBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearSizeFilter();
    // console.log(this.filters.size);
    // this.accumulativeFilter();
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
  }

  onColorFilterChange(i: number) {
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
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
    // this.accumulativeFilter();
  }

  onColorFilterClear() {
    this.colorBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearColorFilter();
    // console.log(this.filters.color);
    // this.accumulativeFilter();
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
  }

  onBrandFilterChange(i: number) {
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
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
    // this.accumulativeFilter();
  }

  onBrandFilterClear() {
    this.brandBtns.forEach(btn => this.render.removeClass(btn.nativeElement, 'active'));
    this.clearFilter.clearBrandFilter();
    // console.log(this.filters.brand);
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
  }

  onPriceSliderChange() {
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
      this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
      this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
      this.priceInputCtrl(fromPrCurr, toPrCurr);
    }
  }

  private priceSliderCtrl(fromPrCurr: number, toPrCurr: number) {
    const toPrMin = this.priceFilterOptions[0];
    const toPrMax = this.priceFilterOptions[this.priceFilterOptions.length - 1];
    this.render.setProperty(this.fromPriceSlider.nativeElement, 'value', fromPrCurr);
    this.render.setProperty(this.toPriceSlider.nativeElement, 'value', toPrCurr);
    this.fillSlider(fromPrCurr, toPrCurr, toPrMin, toPrMax);
  }

  private fillSlider(fromPrCurr: number, toPrCurr: number, toPrMin: number, toPrMax: number) {
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

  onPriceInputChange() {
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
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
    this.priceSliderCtrl(fromPrCurr, toPrCurr);

    // console.log(fromPrCurr, toPrCurr);
  }

  private priceInputCtrl(fromPrCurr: number, toPrCurr: number) {
    // this.frompriceinput.nativeElement.value = String(fromPrCurr);
    // this.topriceinput.nativeElement.value = String(toPrCurr);
    this.render.setProperty(this.fromPriceInput.nativeElement, 'value', String(fromPrCurr));
    this.render.setProperty(this.toPriceInput.nativeElement, 'value', String(toPrCurr));
    // console.log(this.fromPriceInput.nativeElement.value, this.toPriceInput.nativeElement.value);
  }

  onPriceFilterClear() {
    const fromPrCurr = this.priceFilterOptions[0];
    const toPrCurr = this.priceFilterOptions[this.priceFilterOptions.length - 1];
    this.filters.price = { ...priceFltrInit };
    this.filteredItems = [...this.filterService.accumulativeFilter({ ...this.filters }, [...this.listItems])];
    this.priceSliderCtrl(fromPrCurr, toPrCurr);
    this.priceInputCtrl(fromPrCurr, toPrCurr);
  }
  ///////////////////////////////////////////
  trackByIdx(idx: number): number {
    // console.log('INDEXED');
    return idx;
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
