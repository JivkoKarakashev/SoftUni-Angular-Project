import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription, catchError, of } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ShoppingCartService } from './shopping-cart.service';
import { Shipping, shippingInitialState } from 'src/app/types/shipping';
import { Discount, discountInitialState } from 'src/app/types/discount';
import { InvertColor } from '../utils/invertColor';
import { CartItem } from 'src/app/types/cartItem';
import { HttpError } from 'src/app/types/httpError';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { ConfirmOrderService } from 'src/app/checkout/confirm-order/confirm-order.service';

type MyVoid = () => void;

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
})
export class ShoppingCartComponent implements OnInit, AfterViewInit, OnDestroy {

  public user: UserForAuth | null = null;
  public listItems: CartItem[] = [];
  public selectAllButtonStatement = false;
  private cartItemsSubscription: Subscription = new Subscription;

  private unsubscriptionArray: Subscription[] = [];
  private unsubscriptionEventsArray: MyVoid[] = [];
  public loading = true;
  public httpError: HttpError = {};

  public availablePurchaseServices: (Discount | Shipping)[] = [];
  public discountCodes: Discount[] = [];
  public discountValue = 0;
  private discountStateSubscription: Subscription = new Subscription;
  public shippingMethods: Shipping[] = [];
  private shippingStateSubscription: Subscription = new Subscription;

  public form: FormGroup = this.fb.group({
    itms: this.fb.array([]),
    subtotal: [0, [Validators.required]],
    discount: [discountInitialState, [Validators.required]],
    shipping: [shippingInitialState, [Validators.required]],
    total: [0, [Validators.required]],
  });

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder, private invertColor: InvertColor, private router: Router, private userService: UserService, private confirmOrderService: ConfirmOrderService) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;

  @ViewChildren('colorOptionElements') private colorOptionElements!: QueryList<ElementRef>;
  @ViewChildren('colorSelectElements') private colorSelectElements!: QueryList<ElementRef>;

  get itms(): FormArray {
    return this.form.controls["itms"] as FormArray;
  }
  get subtotal(): FormControl {
    return this.form.controls["subtotal"] as FormControl;
  }
  get subtotalValue(): number {
    return this.subtotal.value as number;
  }
  get discount(): FormControl {
    return this.form.controls["discount"] as FormControl;
  }
  get shipping(): FormControl {
    return this.form.controls["shipping"] as FormControl;
  }
  get shippingValue(): number {
    return this.shipping.value.value as number;
  }
  get total(): FormControl {
    return this.form.controls["total"] as FormControl;
  }
  get totalValue(): number {
    return this.total.value as number;
  }

  ngOnInit(): void {
    console.log('Shopping Cart Page INITIALIZED!');
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...userData };
      }
    });
    const availablePurchaseServicesSubscription = this.cartService.getAvailablePurchaseServices().subscribe(availServsObjs => {
      this.loading = false;
      const [discountsObjs, shippingMthdsObjs] = availServsObjs;
      const discounts = Object.entries(discountsObjs).map(disc => disc[1]);
      const shippMthds = Object.entries(shippingMthdsObjs).map(method => method[1]);
      this.discountCodes = [...discounts];
      this.shippingMethods = [...shippMthds];
    });
    this.unsubscriptionArray.push(userSubscription, availablePurchaseServicesSubscription);

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
        this.listItems.push({ _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: selectedSize || '', color, selectedColor: selectedColor || '', quantity, selectedQuantity: selectedQuantity || 0, price, buyed, product, checked });
        this.itms.push(rowItm);
      });
    });
    this.unsubscriptionArray.push(this.cartItemsSubscription);

    this.discountStateSubscription = this.cartService.getDiscountState().subscribe(state => {
      const { code, rate } = state;
      console.log(state);
      if (code !== discountInitialState.code) {
        this.discount.patchValue({ code, rate });
      }
    });
    this.unsubscriptionArray.push(this.discountStateSubscription);

    this.shippingStateSubscription = this.cartService.getShippingState().subscribe(state => {
      console.log(state);
      const { name, value } = state;
      if (name !== shippingInitialState.name) {
        this.shipping.patchValue({ name, value });
      }
    });
    this.unsubscriptionArray.push(this.shippingStateSubscription);

    if (this.itms.length) {
      this.subtotalCalc();
      this.discountCalc(undefined, this.subtotalValue || 0);
      this.totalCalc();
    }
  }

  ngAfterViewInit(): void {
    const closeModalBtnEvent = this.render.listen(this.closeBtn.nativeElement, 'click', this.closeModal.bind(this));
    const closeModalEvent = this.render.listen(this.modal.nativeElement, 'click', this.closeModal.bind(this));
    this.unsubscriptionEventsArray.push(closeModalBtnEvent, closeModalEvent);

    const colorOptionElementsSubscription = this.colorOptionElements.changes.subscribe((els: QueryList<ElementRef>) => {
      // console.log(els);
      els.forEach((el, i) => {
        const nativeEL = el.nativeElement;
        const color = nativeEL.dataset['color'];
        // console.log(el, i);
        // console.log(el.nativeElement.dataset['color']);
        this.render.setStyle(nativeEL, 'background-color', color);
        const rgbObj = this.invertColor.standardize_color(color);
        const hexColor = this.invertColor.invertColor(rgbObj);
        this.render.setStyle(nativeEL, 'color', hexColor || color);
      });
    });
    this.unsubscriptionArray.push(colorOptionElementsSubscription);

    const colorSelectElementsSubscription = this.colorSelectElements.changes.subscribe((el) => {
      this.colorSelectElements.forEach((el, idx) => {
        const nativeEl = el.nativeElement;
        // console.log(this.listItems[idx]);
        if (this.listItems[idx].selectedColor != '') {
          // console.log(this.listItems[idx]);
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
    this.unsubscriptionArray.push(colorSelectElementsSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 7');      
    this.unsubscriptionEventsArray.forEach((eventFn) => {
      eventFn();
      // console.log('UnsubEVENTSArray = 1');
    });
    // console.log('UnsubEVENTSArray = 2');
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
    this.listItems[i] = { ...this.listItems[i], checked: this.itms.controls[i].get('checked')?.value };
    // console.log(i);
    // console.log(this.listItems$[i]);
  }

  toggleSelectAll(): void {
    if (!this.listItems.length) {
      return;
    }
    this.listItems.forEach((itm, i) => {
      this.listItems[i] = { ...itm, checked: !this.selectAllButtonStatement };
    });
    // console.log(this.listItems$);
    this.selectAllButtonStatement = !this.selectAllButtonStatement;
    // console.log(this.listItems$);
  }

  onRemoveSelected(): void {
    // console.log(this.listItems$);
    if (!this.listItems.length) {
      return;
    }
    const notSelected = this.listItems.filter((itm) => !itm.checked);
    const idxArr: number[] = [];
    this.listItems.forEach((itm, idx) => {
      if (itm.checked) {
        idxArr.push(idx);
      }
    });
    for (let i = idxArr.length - 1; i >= 0; i--) {
      this.itms.removeAt(idxArr[i]);
    }
    // console.log(idxArr);
    // console.log(this.itms.value);
    this.listItems = [...notSelected];
    this.subtotalCalc();
    this.discountCalc(undefined, this.subtotalValue);
    this.totalCalc();
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
      // this.itms.controls[i].get('selectedColor')?.patchValue(color);
      this.itms.controls[i].patchValue({ selectedColor: color });
      const rgbObj = this.invertColor.standardize_color(color);
      const hexColor = this.invertColor.invertColor(rgbObj);
      this.render.setStyle(el, 'background-color', color);
      this.render.setStyle(el, 'color', hexColor);
    }
    else {
      this.render.removeStyle(el, 'background-color');
      this.render.removeStyle(el, 'color');
    }
    this.listItems[i] = { ...this.listItems[i], selectedColor: this.itms.controls[i].get('selectedColor')?.value };
    this.cartItemsSubscription.unsubscribe();
    // console.log(color);
    this.cartService.updateCartItm(i, color, undefined, undefined);
  }

  onSizeChange(i: number): void {
    const selectedSize = this.itms.controls[i].get('selectedSize')?.value;
    // console.log(selectedSize);
    this.listItems[i] = { ...this.listItems[i], selectedSize: selectedSize };
    this.cartItemsSubscription.unsubscribe();
    this.cartService.updateCartItm(i, undefined, selectedSize, undefined);
  }
  onShippingChange(e: Event): void {
    const el = e.target as HTMLSelectElement;
    const idx = el.selectedIndex;
    // console.log(idx);
    const { name, value } = this.shippingMethods[idx];
    this.shipping.patchValue({ name, value });
    this.shippingStateSubscription.unsubscribe();
    this.cartService.setShippingState(name, value);
    this.totalCalc();
  }
  onQuantityChange(i: number): void {
    this.setProduct(i);
    this.subtotalCalc();
    this.discountCalc(undefined, this.subtotalValue);
    this.totalCalc();
  }
  onDiscountChange(e: Event): void {
    this.discountCalc(e);
    this.totalCalc();
  }

  discountCalc(e?: Event, subTotVal?: number): void {
    if (e) {
      console.log('Event Invoked!: ', e.target as HTMLSelectElement);
      const el = e.target as HTMLSelectElement;
      const idx = el.selectedIndex;
      console.log('Index:', idx);
      const { code, rate } = this.discountCodes[idx];
      this.discount.patchValue({ code, rate });
      this.discountStateSubscription.unsubscribe();
      this.cartService.setDiscountState(code, rate);
      this.discountValue = this.subtotal.value * (rate || 0) / 100;
    } else if (subTotVal || subTotVal == 0) {
      console.log('SubTotalVal Invoked!', subTotVal);
      const rate = this.discount.value.rate || 0;
      this.discountValue = subTotVal * rate / 100;
    }
  }

  onSubmit() {
    // console.log(!this.listItems.length);
    if (!this.user || this.form.invalid || !this.listItems.length) {
      return;
    }
    const { email, username, address } = this.user;
    const purchasedItems: CartItem[] = [...this.itms.value];
    const subtotal: number = this.subtotal.value;
    const discount: Discount = { ...this.discount.value };
    const discountValue: number = this.discountValue;
    const shippingMethod: Shipping = { ...this.shipping.value };
    const shippingValue: number = this.shippingValue;
    const total: number = this.totalValue;
    const paymentState = 'unpaid';
    this.cartService.placeOrder({ email, username, address, purchasedItems, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState }).pipe(
      catchError((err) => {
        // console.log(err);
        this.httpError = err;
        console.log(err);
        return of(err);
      })
    ).subscribe(res => {
      console.log(res == this.httpError);
      if (res == this.httpError) {
        return;
      }
      console.log(res);
      const dbOrder = { ...res };
      this.confirmOrderService.setDBOrderState({ ...dbOrder });
      this.router.navigate(['/checkout']);
    });
    // console.log(this.form.value);
    // console.log(this.listItems);
    // console.log(this.form.get('itms')?.value);
    // console.log(this.subTotal.value);
    // console.log(this.discountValue);
    // console.log(this.form.get('shipping')?.value);
    // console.log(this.total);
  }

  onRemoveItem(ItmIdx: number) {
    // console.log(this.listItems$);
    const newListItems = this.listItems.filter((itm, idx) => idx != ItmIdx ? itm : null);
    this.listItems = [...newListItems];
    // console.log(this.listItems);
    this.itms.removeAt(ItmIdx);
    this.subtotalCalc();
    this.discountCalc(undefined, this.subtotalValue);
    this.totalCalc();
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItm(ItmIdx);
  }

  setProduct(i: number): void {/*///// -> triggered on Quantity changes/////*/
    // console.log(i);
    console.log('setProduct Invoked!');
    const selectedQuantity = this.itms.controls[i].get('selectedQuantity')?.value;
    const product = selectedQuantity * this.listItems[i].price;
    this.listItems[i] = { ...this.listItems[i], selectedQuantity: selectedQuantity, product: product };
    this.itms.controls[i].patchValue({ product: product });
    this.cartItemsSubscription.unsubscribe();
    this.cartService.updateCartItm(i, undefined, undefined, selectedQuantity, product);
  }

  subtotalCalc(): void {
    console.log('subtotalCalc Invoked!');
    this.subtotal.setValue(this.listItems.map(itm => itm.product).reduce((acc, currVal) => acc += currVal, 0));
    // console.log(subTotal);
  }

  totalCalc(): void {
    console.log('totalCalc invoked!');
    this.total.setValue(this.subtotalValue - this.discountValue + this.shippingValue);
  }

  logout(): void {
    this.userService.logout().pipe(
      catchError((err) => {
        console.log(err);
        this.httpError = err;
        return of(err);
      })
    ).subscribe(res => {
      if (res == this.httpError) {
        return;
      }
    });
    this.cartService.emptyCart();
    this.confirmOrderService.resetDBOrderState();
    this.router.navigate(['/auth/login']);
  }

  public trackById(index: number, item: CartItem): string {
    // console.log(index);
    // console.log(item._id);
    return item._id;
  }
}
