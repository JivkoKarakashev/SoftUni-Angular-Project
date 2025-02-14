import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { EMPTY, Observable, Subscription, catchError, of } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { UserForAuth } from 'src/app/types/user';
import { CartItem, Item } from 'src/app/types/item';

import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';
import { UserStateManagementService } from '../state-management/user-state-management.service';
import { ErrorsService } from '../errors/errors.service';
import { ToastrMessageHandlerService } from '../utils/toastr-message-handler.service';
import { CapitalizeCategoryService } from '../utils/capitalize-category.service';
import { InvertColorService } from '../utils/invert-color.service';
import { ProductDetailsService } from './product-details.service';

import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { CustomError } from '../errors/custom-error';

const BASE_URL = `${environment.apiDBUrl}/data`;

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;

  public item: Item | null = null;
  public cartItemsCounter = 0;
  public selectedImgUrl = '';
  public showScrollUpBtn = false;

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
    private http: HttpClient,
    private errorsService: ErrorsService,
    private router: Router,
    private render: Renderer2,
    private cartService: ShoppingCartService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private catalogManagerService: CatalogManagerService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private invertColorService: InvertColorService,
    private viewportScroller: ViewportScroller,
    private detailsService: ProductDetailsService
  ) { this.cartItemsCounter = this.cartStateMgmnt.getCartItemsCount() }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef>;

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

    const detailsSub = this.getItem(url, id)
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
          console.log(res instanceof Observable);
          this.router.navigate(['**']);
        }
        if (res instanceof HttpErrorResponse) {
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
          return;
        }
        const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = res as Item;
        this.item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price };
        this.detailsService.setProductDetails({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price });
        this.populateForm();
      });
    this.unsubscriptionArray.push(detailsSub);
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

  private getItem(url: string, id: string): Observable<Item> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Item>(`${BASE_URL}/${url}/${id}`, { headers });
  }

  onColorselect(idx: number): void {
    try {
      const { altImages } = this.detailsAvailability();
      this.selectedImgUrl = altImages[idx];
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
  }

  trackByUrl(_index: number, url: string): string {
    // console.log(url);
    return url;
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
            this.detailsService.setProductDetails({ ...details });
            this.populateForm();
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
    try {
      const { _id, cat, subCat } = this.detailsAvailability();
      const deleteSub = this.catalogManagerService.deleteItem(subCat, _id)
        .pipe(
          catchError(err => { throw err; })
        )
        .subscribe(
          {
            next: () => {
              this.toastrMessageHandler.showInfo();
              this.router.navigate([`/catalog/${cat}/${subCat}`]);
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
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }

  }

  onEdit(): void {
    try {
      const item = this.detailsAvailability();
      this.catalogManagerService.setCatalogItemToEdit({ ...item });
      this.router.navigate(['/edit-product']);
    } catch (err) {
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }
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
