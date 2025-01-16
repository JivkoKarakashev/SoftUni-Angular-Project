import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subscription, catchError, of } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { UserForAuth } from 'src/app/types/user';

import { Belt, Blazer, Boot, Bottom, Cap, CartItem, Glove, Gym, Hat, Item, Jacket, Legging, Longwear, Outdoors, Partywear, Running, Ski, Slippers, Snowboard, Sunglasses, Surf, Sweater, Swim, Tie, Trainers, Tuxedo, Waistcoat, Watch, initialItem } from 'src/app/types/item';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { CatalogManagerService } from 'src/app/catalog-manager/catalog-manager.service';

import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { UserStateManagementService } from '../state-management/user-state-management.service';
import { ErrorsService } from '../errors/errors.service';
import { ToastrMessageHandlerService } from '../utils/toastr-message-handler.service';
import { CapitalizeCategoryService } from '../utils/capitalize-category.service';

const BASE_URL = `${environment.apiDBUrl}/data`;

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;

  public item: Jacket | Longwear |
    Trainers | Boot | Slippers |
    Cap | Hat | Belt | Glove | Sunglasses | Watch |
    Gym | Running | Ski | Snowboard | Swim | Surf | Outdoors | Bottom | Legging | Sweater |
    Blazer | Jacket | Waistcoat | Tuxedo | Partywear | Tie = initialItem;
  public cartItemsCounter = 0;
  public selectedImgUrl = '';

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
  private formInitalValue: FormGroup = this.fb.group({ fgItem: this.fb.group({ ...this.itemCtrlsGr.value }) });

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

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
    public capitalizeCategoryService: CapitalizeCategoryService
  ) { this.cartItemsCounter = this.cartStateMgmnt.getCartItemsCount() }

  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef>;

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

    const detailsSubscription = this.getItem(url, id)
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
        (this.formInitalValue.get('fgItem') as FormGroup).patchValue({ ...this.itemCtrlsGr.value });
        // console.log({ ...this.itemCtrlsGr.value });
        // console.log(this.formInitalValue.get('fgItem')?.value);
      });
    this.unsubscriptionArray.push(detailsSubscription);
  }

  ngAfterViewInit(): void {
    const spanElementsSubscription = this.spanColorElements.changes.subscribe((els: QueryList<ElementRef>) => {
      els.forEach((el, i) => {
        this.render.setStyle(el.nativeElement, 'background-color', this.itemCtrlsGr.get('color')?.value[i]);
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
    // console.log('UnsubArray = 4');
  }

  private getItem(url: string, id: string): Observable<
    Jacket | Longwear |
    Trainers | Boot | Slippers |
    Cap | Hat | Belt | Glove | Sunglasses | Watch |
    Gym | Running | Ski | Snowboard | Swim | Surf | Outdoors | Bottom | Legging | Sweater |
    Blazer | Jacket | Waistcoat | Tuxedo | Partywear | Tie> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<
      Jacket | Longwear |
      Trainers | Boot | Slippers |
      Cap | Hat | Belt | Glove | Sunglasses | Watch |
      Gym | Running | Ski | Snowboard | Swim | Surf | Outdoors | Bottom | Legging | Sweater |
      Blazer | Jacket | Waistcoat | Tuxedo | Partywear | Tie
    >(`${BASE_URL}/${url}/${id}`, { headers });
  }

  selectColor(idx: number): void {
    this.selectedImgUrl = this.item.altImages[idx];
  }

  trackByUrl(index: number, url: string): string {
    // console.log(url);
    return url;
  }

  onAddToCart(): void {
    if (this.form.invalid) {
      console.log('Invalid FORM!');
      return;
    }
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price } = this.itemCtrlsGr.value as CartItem;
    const product = selectedQuantity * price;
    this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, product, checked: false });
    this.itemCtrlsGr.reset({ ...this.formInitalValue.get('fgItem')?.value });
    this.selectedImgUrl = this.item.image;
    this.cartItemsCounter++;
    this.toastrMessageHandler.showSuccess('Item was successfully added to the cart!');
    // console.log(this.cartItms$$.value);
  }

  onDelete(): void {
    const { _id, cat, subCat } = this.item;
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
  }

  onEdit(): void {
    this.catalogManagerService.setCatalogItemToEdit({ ...this.item });
    this.router.navigate(['/edit-product']);
  }
}
