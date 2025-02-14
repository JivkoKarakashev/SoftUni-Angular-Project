import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY, Subscription, catchError, switchMap, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { CartItem, Item } from 'src/app/types/item';

import { UserStateManagementService } from '../state-management/user-state-management.service';
import { RelatedProductsService } from './related-products.service';
import { RelatedProductsPaginationConfig, RelatedProductsPaginationService, relatedProductsPaginationConfigInit } from '../utils/pagination-related-products.service';
import { ErrorsService } from '../errors/errors.service';
import { InvertColorService } from '../utils/invert-color.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { ToastrMessageHandlerService } from '../utils/toastr-message-handler.service';
import { ProductDetailsService } from '../product-details/product-details.service';
import { NgConfirmService } from 'ng-confirm-box';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';
import { CustomError } from '../errors/custom-error';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.css']
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
    private catalogManagerService: CatalogManagerService,
    private confirmService: NgConfirmService
  ) { }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef<HTMLSpanElement>>;
  @Output() relatedProductAddEvent = new EventEmitter();
  @Output() productDetailsChangeEvent = new EventEmitter();

  ngOnInit(): void {
    console.log('Related Products Page INITIALIZED!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    try {
      this.product = this.detailsAvailability();
      const fetchRelatedProductsSub = this.fetchRelatedProductss().subscribe();
      this.unsubscriptionArray.push(fetchRelatedProductsSub);
    } catch (err) {
      this.loading = false;
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
  }
  ngAfterViewInit(): void {
    // console.log('HERE');
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
    // this.itemSubscription.unsubscribe();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 4 - infinity');
  }

  onAddRelatedProduct(i: number): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = this.filteredProducts[i];
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    this.cartService.addCartItem({ ...newCartItem });
    this.relatedProductAddEvent.emit();
    this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
  }
  onEditRelatedProduct(i: number): void {
    this.confirmService.showConfirm('Edit this item?',
      () => {
        this.catalogManagerService.setCatalogItemToEdit({ ...this.filteredProducts[i] });
        this.router.navigate(['/edit-product']);
      },
      () => { return; }
    );
  }
  onDeleteRelatedProduct(i: number): void {
    this.confirmService.showConfirm('Delete this item?',
      () => {
        const { _id, subCat } = this.filteredProducts[i];
        const deleteSub = this.catalogManagerService.deleteItem(subCat, _id)
          .pipe(
            catchError(err => { throw err; }),
            switchMap(() => {
              return this.fetchRelatedProductss();
            }),
          )
          .subscribe(
            {
              next: () => {
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
  onDetailsChange(i: number) {
    this.detailsService.setProductDetails({ ...this.filteredProducts[i] });
    this.productDetailsChangeEvent.emit();
  }

  public trackById(_index: number, product: Item): string {
    // console.log(slide._id);
    return product._id;
  }

  onCarouselMove(selectedPage: number) {
    this.selected.page = selectedPage || 1;
    const fetchRelatedProductsSub = this.fetchRelatedProductss().subscribe();
    this.unsubscriptionArray.push(fetchRelatedProductsSub);
  }

  private fetchRelatedProductss() {
    this.loading = true;
    return this.relatedProductsService.getCollectionSize()
      .pipe(
        switchMap(collSize => {
          if (collSize === 0) {
            this.loading = false;
            return EMPTY;
          }
          this.paginationConfig = this.paginationService.relatedProductsPaginationConfigCalc(collSize, this.selected.pageSize, this.selected.page);
          const { selectedPage, skipSizeReq, pageSizeReq } = this.paginationConfig;
          this.selected.page = selectedPage;
          console.log('fetchCollectionSize');
          return this.relatedProductsService.getRelatedProductsByPage(skipSizeReq, pageSizeReq)
            .pipe(
              tap(
                rltdProds => {
                  console.log('fetchRelatedProducts');
                  this.loading = false;
                  this.relatedProducts = [...rltdProds];
                  this.filteredProducts = rltdProds.filter(itm => itm._id !== this.product?._id);
                }
              )
            );
        }),
      );
  }

  private detailsAvailability() {
    const product = this.detailsService.getProductDetails();
    if (product === null) {
      const error: CustomError = {
        name: 'Item Error',
        message: 'Item is null!',
        isUserError: false,
      };
      throw error;
    }
    return product;
  }
}
