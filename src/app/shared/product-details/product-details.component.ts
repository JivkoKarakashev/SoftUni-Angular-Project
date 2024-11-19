import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, catchError, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from '../state-management/user-state-management.service';

import { Belt, Blazer, Boot, Bottom, Cap, CartItem, Glove, Gym, Hat, Jacket, Legging, Longwear, Outdoors, Partywear, Running, Ski, Slippers, Snowboard, Sunglasses, Surf, Sweater, Swim, Tie, Trainers, Tuxedo, Waistcoat, Watch, initialItem } from 'src/app/types/item';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';

import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';

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
  public defImgOpacity = 1;

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
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private render: Renderer2,
    private cartService: ShoppingCartService,
    private cartStateMgmnt: ShoppingCartStateManagementService
  ) { this.cartItemsCounter = this.cartStateMgmnt.getCartItemsCount() }

  @ViewChildren('imgElements') private imgElements!: QueryList<ElementRef>;
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
        catchError(err => { throw err; })
      )
      .subscribe({
        next: (itm) => {
          this.loading = false;
          // this.item = itm;
          const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = itm;
          // const buyed = this.cartItms$$.value.some(itm => itm._id == _id);
          // const inCart = this.cartItms.some(itm => itm._id == _id);
          this.item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price };
          // console.log(itm);
          // console.log(this.item);
          // console.log(this.cartItms$$.value);
          // const propsArr = Object.entries(itm);
          // console.log(propsArr);
          // propsArr.forEach(([k, v]) => {
          //   (this.form.get('fgItem') as FormGroup).addControl(k, new FormControl(v, Validators.required));
          // });
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
        },
        error: err => {
          this.loading = false;
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          console.log(err);
          console.log(this.httpErrorsArr);
        }
      });
    this.unsubscriptionArray.push(detailsSubscription);
  }

  ngAfterViewInit(): void {
    // console.log(this.spanCol);
    // console.log(this.img);
    const spanElementsSubscription = this.spanColorElements.changes.subscribe((els: QueryList<ElementRef>) => {
      // console.log(els.length);
      // els.forEach(el => {
      //   console.log(el.nativeElement);
      // });
      els.forEach((el, i) => {
        // console.log(el.nativeElement);
        // console.log(this.itemCtrlsGr.get('color')?.value[i]);
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

  selectColor(): void {
    this.imgElements.forEach(el => {
      // console.log(el.nativeElement.dataset['image']);
      // console.log(this.selectedColor?.value);
      if (el.nativeElement.dataset['image'] == this.selectedColor?.value) {
        this.defImgOpacity = 0;
        el.nativeElement.classList.contains('active') ? null : this.render.addClass(el.nativeElement, 'active');
      } else {
        el.nativeElement.classList.contains('active') ? this.render.removeClass(el.nativeElement, 'active') : null;
      }
    });
  }

  public trackByUrl(index: number, url: string): string {
    // console.log(url);
    return url;
  }

  public addItemtoCart(): void {
    if (this.form.invalid) {
      console.log('Invalid FORM!');
      return;
    }
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price } = this.itemCtrlsGr.value as CartItem;
    const product = selectedQuantity * price;
    this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, product, checked: false });
    // this.item = { ...this.item, inCart: true };
    this.itemCtrlsGr.reset({ ...this.formInitalValue.get('fgItem')?.value });
    this.imgElements.forEach(el => el.nativeElement.classList.contains('active') ? this.render.removeClass(el.nativeElement, 'active') : null);
    this.defImgOpacity = 1;
    this.cartItemsCounter++;
    // console.log(this.cartItms$$.value);
  }

}
