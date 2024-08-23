import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription, catchError, of } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ShoppingCartService } from '../shopping-cart.service';
import { Shipping } from 'src/app/types/shipping';
import { Discount } from 'src/app/types/discount';
import { InvertColor } from '../utils/invertColor';
import { CartItem } from 'src/app/types/cartItem';
import { HttpError } from 'src/app/types/httpError';
import { UserService } from 'src/app/user/user.service';

type MyVoid = () => void;

@Component({
  selector: 'app-shopping-cart-desktop',
  templateUrl: './shopping-cart-desktop.component.html',
  styleUrls: ['./shopping-cart-desktop.component.css'],
})
export class ShoppingCartDesktopComponent implements OnInit, AfterViewInit, OnDestroy {

  public listItems$: CartItem[] = [];
  public selectAllButtonStatement: boolean = false;
  private unsubscriptionArray: Subscription[] = [];
  private cartItemsSubscription: Subscription = new Subscription;
  private unsubscriptionEventsArray: MyVoid[] = [];
  public subTotal$: number = 0;

  public loading: boolean = true;

  public shippingMethods$: Shipping[] = [];
  private selectedShippingMethod$: Shipping = {
    name: '',
    value: NaN
  }
  public shippingValue: number = 0;
  public discountCodes$: Discount[] = [];
  public discountValue: number = 0;
  private discountStateSubscription: Subscription = new Subscription;
  public discountState$: Discount = { code: '', rate: NaN };
  public availablePurchaseServices: (Discount | Shipping)[] = [];

  public total$: number = 0;

  public itmsArr: FormArray = this.fb.array([]);
  public form: FormGroup = this.fb.group({
    itms: this.itmsArr,
    shipping: ['', [Validators.required]],
    discount: [{
      code: '',
      rate: NaN
    }, [Validators.required]]
  });
  public httpError: HttpError = {};

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder, private invertColor: InvertColor, private router: Router, private userService: UserService) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;

  @ViewChildren('optionElements') private optionElements!: QueryList<ElementRef>;
  @ViewChildren('selectElements') private selectElements!: QueryList<ElementRef>;

  get itms() {
    return this.form.controls["itms"] as FormArray;
  }
  get shipping() {
    return this.form.controls["shipping"] as FormArray;
  }
  get shippingVal() {
    return Number(this.form.controls["shipping"].value) as number;
  }

  ngOnInit(): void {
    console.log('Shopping Cart Page INITIALIZED!');
    const availablePurchaseServicesSubscription = this.cartService.getAvailablePurchaseServices().subscribe(availServsObjs => {
      this.loading = false;
      let [discountsObjs, shippingMthdsObjs] = availServsObjs;
      // console.log(jacketsObjs, longwearObjs);      
      let discounts = Object.entries(discountsObjs).map(disc => disc[1]);
      let shippMthds = Object.entries(shippingMthdsObjs).map(method => method[1]);
      // console.log(discounts);
      // console.log(shippMthds);
      this.discountCodes$ = [...discounts];
      this.shippingMethods$ = [...shippMthds];
    });
    this.unsubscriptionArray.push(availablePurchaseServicesSubscription);

    this.cartItemsSubscription = this.cartService.getCartItems().subscribe(cartItms => {
      cartItms.forEach((itm) => {
        const { _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, buyed, product, checked } = itm;
        const rowItm = this.fb.group({
          _id,
          _ownerId,
          _createdOn,
          image,
          altImages: [altImages],
          cat,
          subCat,
          description,
          brand,
          size: [size],
          selectedSize: [selectedSize || '', [Validators.required,]],
          color: [color],
          selectedColor: [selectedColor || '', [Validators.required,]],
          quantity,
          selectedQuantity: [selectedQuantity || '', [Validators.required,]],
          price,
          buyed,
          product,
          checked
        });
        this.listItems$.push({ _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: selectedSize || '', color, selectedColor: selectedColor || '', quantity, selectedQuantity: selectedQuantity || 0, price, buyed, product, checked });
        this.itms.push(rowItm);
      });
      // console.log(this.listItems$)
      // console.log(this.itms.value);
      // this.listItems$ = items;
      // console.log(this.listItems$);
      // console.log(this.itms);
    });
    this.unsubscriptionArray.push(this.cartItemsSubscription);
    // console.log(this.unsubscriptionArray);

    this.discountStateSubscription = this.cartService.getDiscountState().subscribe(state => {
      const { code, rate } = state;
      this.discountState$ = { ...this.discountState$, code, rate };
      this.form.get('discount')?.patchValue({ code, rate });
      // console.log(this.discountState$);
      // console.log(this.form.get('discount')?.value);
      // console.log('DiscountCode: ',code);
      // console.log('DiscountRate: ',rate);
    });
    this.unsubscriptionArray.push(this.discountStateSubscription);
    this.subTotal$ = this.getSubtotal();
    this.discountValue = this.getDiscount(undefined, this.subTotal$ || 0);
    this.shippingValue = this.shippingVal || 0;
    this.total$ = this.getTotal();
  }

  ngAfterViewInit(): void {
    const closeModalBtnEvent = this.render.listen(this.closeBtn.nativeElement, 'click', this.closeModal.bind(this));
    const closeModalEvent = this.render.listen(this.modal.nativeElement, 'click', this.closeModal.bind(this));
    this.unsubscriptionEventsArray.push(closeModalBtnEvent, closeModalEvent);

    const optionElementsSubscription = this.optionElements.changes.subscribe((els: QueryList<ElementRef>) => {
      // console.log(els);
      els.forEach((el, i) => {
        const nativeEL = el.nativeElement;
        const color = nativeEL.dataset['color'];
        // console.log(el, i);
        // console.log(el.nativeElement.dataset['color']);
        this.render.setStyle(nativeEL, 'background-color', color);
        const rgbObj = this.invertColor.standardize_color(color);
        const hexColor = this.invertColor.invertColor(rgbObj);
        this.render.setStyle(nativeEL, 'color', hexColor);
      });
    });
    this.unsubscriptionArray.push(optionElementsSubscription);

    const selectElementsSubscription = this.selectElements.changes.subscribe((el) => {
      this.selectElements.forEach((el, idx) => {
        const nativeEl = el.nativeElement;
        // console.log(this.listItems$[idx]);
        if (this.listItems$[idx].selectedColor != '') {
          // console.log(this.listItems$[idx]);
          const color = nativeEl.value;
          // console.log(nativeEl.value);
          // console.log(el, idx);
          this.render.setStyle(nativeEl, 'background-color', color);
          const rgbObj = this.invertColor.standardize_color(color);
          const hexColor = this.invertColor.invertColor(rgbObj);
          this.render.setStyle(nativeEl, 'color', hexColor);
        }
      });
    });
    this.unsubscriptionArray.push(selectElementsSubscription);
  };

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    this.unsubscriptionEventsArray.forEach((eventFn) => {
      eventFn();
      // console.log('UnsubEVENTSArray = 4'); 
    });
  }

  closeModal(e: Event) {
    // console.log(e.target);
    e.stopPropagation();
    if (e.target == this.closeBtn.nativeElement || e.target == this.modal.nativeElement) {
      this.location.back();
    }
  }

  toggleSelect(e: Event, i: number): void {
    // const el = e.target as HTMLSelectElement;
    this.listItems$[i] = { ...this.listItems$[i], checked: this.itms.controls[i].get('checked')?.value };
    // this.listItems$[i].checked = this.itms.controls[i].get('checked')?.value;
    // console.log(i);
    // console.log(this.listItems$[i]);
  }

  toggleSelectAll(): void {

    if (!this.listItems$.length) {
      return;
    }
    this.listItems$.forEach((itm, i) => {
      this.listItems$[i] = { ...itm, checked: !this.selectAllButtonStatement };
    });
    // console.log(this.listItems$);
    this.selectAllButtonStatement = !this.selectAllButtonStatement;
    // console.log(this.listItems$);
  }

  onRemoveSelected(): void {
    // console.log(this.listItems$);
    if (!this.listItems$.length) {
      return;
    }
    const notSelected = this.listItems$.filter((itm) => !itm.checked);
    const idxArr: number[] = [];
    this.listItems$.forEach((itm, idx) => {
      if (itm.checked) {
        idxArr.push(idx);
      }
    });
    for (let i = idxArr.length - 1; i >= 0; i--) {
      this.itms.removeAt(idxArr[i]);
    }
    this.listItems$ = notSelected;
    this.subTotal$ = this.getSubtotal();
    this.discountValue = this.getDiscount(undefined, this.subTotal$);
    this.total$ = (this.getTotal());
    // console.log(idxArr);
    // console.log(this.itms.value);
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItems(idxArr);
  }

  onColorChange(e: Event, i: number): void {
    const el = e.target as HTMLSelectElement;
    // const color = el.options[el.selectedIndex].text;
    const color = el.value;
    // console.log(el.value);
    // console.log(el);
    if (color) {
      this.itms.controls[i].get('selectedColor')?.patchValue(color);
      this.itms.controls[i].patchValue({ selectedColor: color });
      const rgbObj = this.invertColor.standardize_color(color);
      const hexColor = this.invertColor.invertColor(rgbObj);
      // console.log(this.itms.value);
      // console.log(this.itms.controls[i]);
      // console.log(i);
      // console.log(this.selectedColor);
      // console.log(this.itms.controls[i].get('selectedColor')?.value);
      // console.log(this.itms.controls[i].get('color')?.value);
      this.render.setStyle(el, 'background-color', color);
      this.render.setStyle(el, 'color', hexColor);
    }
    else {
      this.render.removeStyle(el, 'background-color');
      this.render.removeStyle(el, 'color');
    }
    // console.log(this.listItems$[i].selectedColor);
    this.listItems$[i] = { ...this.listItems$[i], selectedColor: this.itms.controls[i].get('selectedColor')?.value };
    this.cartItemsSubscription.unsubscribe();
    // console.log(color);
    this.cartService.updateCartItm(i, color, undefined, undefined);
    // this.listItems$[i].selectedColor = this.itms.controls[i].get('selectedColor')?.value;
    // console.log(this.listItems$[i].selectedColor);
    // console.log(this.listItems$);
  }

  onSizeChange(i: number): void {
    const selectedSize = this.itms.controls[i].get('selectedSize')?.value;
    // console.log(selectedSize);
    this.listItems$[i] = { ...this.listItems$[i], selectedSize: selectedSize };
    this.cartItemsSubscription.unsubscribe();
    this.cartService.updateCartItm(i, undefined, selectedSize, undefined);
  }
  onShippingChange(e: Event): void {
    this.shippingValue = this.shippingVal || 0;
    const el = e.target as HTMLSelectElement;
    const idx = el.selectedIndex - 1;
    // console.log(idx);
    if (idx >= 0 && idx < this.shippingMethods$.length) {
      const { name, value } = this.shippingMethods$[idx];
      this.selectedShippingMethod$ = { ...this.selectedShippingMethod$, name: name, value: value };
    }
    // console.log(this.shippingVal);
    // return this.shippingValue;
    this.total$ = this.getTotal();
  }
  onQuantityChange(i: number): void {
    this.setProduct(i);
    this.subTotal$ = this.getSubtotal();
    this.discountValue = this.getDiscount(undefined, this.subTotal$);
    this.total$ = this.getTotal();
  }
  onDiscountChange(e: Event): void {
    this.discountValue = this.getDiscount(e);
    this.total$ = this.getTotal();
  }
  getDiscount(e?: Event, subTotVal?: number): number {
    console.log('Event Invoked!: ', e?.target as HTMLSelectElement);
    console.log('SubTotalVal Invoked!', subTotVal);
    if (e) {
      const el = e.target as HTMLSelectElement;
      const idx = el.selectedIndex - 1;
      console.log('Index:', idx);
      let { code, rate } = this.discountCodes$[idx];
      code = code || '';
      rate = rate || NaN;
      this.discountState$ = { ...this.discountState$, code, rate };
      this.form.get('discount')?.patchValue({ code, rate });
      this.discountStateSubscription.unsubscribe();
      this.cartService.setDiscountState(code, rate);
      this.discountValue = this.subTotal$ * (rate || 0) / 100;
    } else if (subTotVal || subTotVal == 0) {
      const { rate } = this.discountState$;
      const discountRate = rate || 0;
      this.discountValue = subTotVal * discountRate / 100;
    }
    return this.discountValue;
  }

  onSubmit() {
    // console.log(!this.listItems$.length);
    if (this.form.invalid || !this.listItems$.length) {
      return;
    }
    const purchasedItems: CartItem[] = this.form.get('itms')?.value;
    const subtotal: number = this.subTotal$;
    const discount: Discount = { ...this.discountState$ };
    const discountValue: number = this.discountValue;
    const shippingMethod: Shipping = { ...this.selectedShippingMethod$ };
    const shippingValue: number = this.shippingValue;
    const total: number = this.total$;
    this.cartService.placeOrder(purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total).pipe(
      catchError((err) => {
        // console.log(err);
        this.httpError = err;
        // console.log(err);
        return of(err);
      })
    ).subscribe(order => {
      if (order == this.httpError) {
        return;
      }
      console.log(order);
    });
    // console.log(this.form.value);
    // console.log(this.listItems$);
    // console.log(this.form.get('itms')?.value);
    // console.log(this.subTotal$.value);
    // console.log(this.discountValue);
    // console.log(this.form.get('shipping')?.value);
    // console.log(this.total$);
  }

  onRemoveItem(ItmIdx: number) {
    // console.log(this.listItems$);
    const newListItems = this.listItems$.filter((itm, idx) => idx != ItmIdx ? itm : null);
    this.listItems$ = newListItems;
    // console.log(this.listItems$);
    this.itms.removeAt(ItmIdx);
    this.subTotal$ = this.getSubtotal();
    this.discountValue = this.getDiscount(undefined, this.subTotal$);
    // console.log(this.subTotal$);
    this.total$ = this.getTotal();
    // console.log(this.total$);
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItm(ItmIdx);
  }

  setProduct(i: number): void {/*///// -> triggered on Quantity changes/////*/
    // console.log(i);
    console.log('getPeoduct Invoked!');
    const selectedQuantity = this.itms.controls[i].get('selectedQuantity')?.value;
    this.listItems$[i] = { ...this.listItems$[i], selectedQuantity: selectedQuantity };
    const product = this.listItems$[i].selectedQuantity * this.listItems$[i].price;
    // const product = this.listItems$[i].product = this.listItems$[i].selectedQuantity * this.listItems$[i].price;
    this.listItems$[i] = { ...this.listItems$[i], product: product };
    this.itms.controls[i].patchValue({ product: product });
    this.cartItemsSubscription.unsubscribe();
    this.cartService.updateCartItm(i, undefined, undefined, selectedQuantity, product);
    // return product;
  }

  getSubtotal(): number {
    console.log('getSubtotal Invoked!');
    const subTotal = this.listItems$.map(itm => itm.product).reduce((acc, currVal) => acc += currVal, 0);
    // console.log(subTotal);
    return subTotal;
  }

  getTotal(): number {
    // console.log(`subTotal: ${this.subTotal$.value}`);
    // console.log(`discount: ${this.discountValue}`);
    // console.log(`Shipping:  ${this.shippingValue}`);
    console.log('getTotal invoked!');
    const total = this.total$ = this.subTotal$ - this.discountValue + this.shippingValue;
    return total;
  }

  logout() {
    this.cartService.emptyCart();
    this.userService.logout();
    this.router.navigate(['/auth/login']);
  }

  public trackById(index: number, item: CartItem): string {
    // console.log(index);
    // console.log(item._id);
    return item._id;
  }
}
