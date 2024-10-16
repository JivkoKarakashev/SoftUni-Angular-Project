import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

import { Gym } from 'src/app/types/gym';
import { Running } from 'src/app/types/running';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { SwimSurf } from 'src/app/types/swimSurf';
import { Outdoors } from 'src/app/types/outdoors';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { Sweater } from 'src/app/types/sweater';
import { BlazerJacket } from 'src/app/types/blazerJacket';
import { Waistcoat } from 'src/app/types/waistcoat';
import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';
import { Tie } from 'src/app/types/tie';
import { CapHat } from 'src/app/types/capHat';
import { Belt } from 'src/app/types/belt';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';
import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';
import { initialItem } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { CartItem } from 'src/app/types/cartItem';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  public item: Jacket | Longwear |
    Trainers | Boot | Slippers |
    CapHat | Belt | Glove | Sunglasses | Watch |
    Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater |
    BlazerJacket | Waistcoat | TuxedoPartywear | Tie = initialItem;
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;
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

  constructor(private userService: UserService, private route: ActivatedRoute, private fb: FormBuilder, private http: HttpClient, private router: Router, private render: Renderer2, private cartService: ShoppingCartService) { }

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
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...userData };
      }
    });
    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });
    const itemSubscription = this.getItem(url, id).subscribe(itm => {
      // this.item$ = itm;
      this.loading = false;
      const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = itm;
      const buyed = this.cartItms$$.value.some(itm => itm._id == _id);
      this.item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price, buyed }
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
    });
    this.unsubscriptionArray.push(userSubscription, itemSubscription, cartSubscription);
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

  private getItem(url: string, id: string) {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<
      Jacket | Longwear |
      Trainers | Boot | Slippers |
      CapHat | Belt | Glove | Sunglasses | Watch |
      Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater |
      BlazerJacket | Waistcoat | TuxedoPartywear | Tie
    >(`http://localhost:3030/data/${url}/${id}`, { headers });
  }

  // public selectSize(e: Event): void {
  //   const el = e.target as HTMLSelectElement;
  //   // const size = el.options[el.selectedIndex].text;
  //   const size = el.value;
  // }

  public selectColor(): void {
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
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price } = this.itemCtrlsGr.value;
    const buyed = true;
    const product = selectedQuantity * price;
    this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, buyed, product, checked: false });
    this.item = { ...this.item, buyed: true };
    this.itemCtrlsGr.reset({ ...this.formInitalValue.get('fgItem')?.value });
    this.imgElements.forEach(el => el.nativeElement.classList.contains('active') ? this.render.removeClass(el.nativeElement, 'active') : null);
    this.defImgOpacity = 1;
    // console.log(this.cartItms$$.value);
  }

}
