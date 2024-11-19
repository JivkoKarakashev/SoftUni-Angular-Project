import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { Subject, Subscription, catchError, switchMap, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { DestroySubsNotifierService } from '../utils/destroy-subs-notifier.service';

import { ShoppingCartService } from './shopping-cart.service';
import { Shipping, shippingInitialState } from 'src/app/types/shipping';
import { Discount, discountInitialState } from 'src/app/types/discount';
import { InvertColorService } from '../utils/invert-color.service';
import { CartItem } from 'src/app/types/item';

import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

import { UserStateManagementService } from '../state-management/user-state-management.service';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { OrderStateManagementService } from '../state-management/order-state-management.service';
import { TradedItemsStateManagementService } from '../state-management/traded-items-state-management.service';

type MyVoid = () => void;

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
})
export class ShoppingCartComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>;

  public user: UserForAuth | null = null;
  public cartItems: CartItem[] = [];
  public selectAllButtonStatement = false;

  private unsubscriptionArray: Subscription[] = [];
  private unsubscriptionEventsArray: MyVoid[] = [];
  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public errorsArr: Error[] = [];

  public availablePurchaseServices: (Discount | Shipping)[] = [];
  public discountCodes: Discount[] = [];
  public discountValue = 0;
  public shippingMethods: Shipping[] = [];

  public form: FormGroup = this.fb.group({
    itms: this.fb.array([]),
    subtotal: [0, [Validators.required]],
    discount: [discountInitialState, [Validators.required]],
    shipping: [shippingInitialState, [Validators.required]],
    total: [0, [Validators.required]],
  });

  constructor
    (
      private destroySubsNotifier: DestroySubsNotifierService,
      private userStateMgmnt: UserStateManagementService,
      private cartService: ShoppingCartService,
      private cartStateMgmnt: ShoppingCartStateManagementService,
      private render: Renderer2,
      private location: Location,
      private fb: FormBuilder,
      private invertColor: InvertColorService,
      private router: Router,
      private userService: UserService,
      private orderStateMgmnt: OrderStateManagementService,
      private tradedItmsStateMgmnt: TradedItemsStateManagementService
    ) { }

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
    const destroySubscription = this.destroySubsNotifier.getNotifier().subscribe(() => this.destroy$.next());
    this.unsubscriptionArray.push(destroySubscription);

    const cartSubscription = this.userStateMgmnt.getUserState()
      .pipe(
        switchMap(userData => {
          if (userData) {
            this.user = { ...this.user, ...userData };
          } else {
            this.errorsArr.push({ message: 'Please Login or Register to complete Order!', name: 'User Error' });
          }
          return this.cartService.getAvailablePurchaseServices();
        }),
        takeUntil(this.destroy$),
        switchMap(availServsObjs => {
          const [discountsObjs, shippingMthdsObjs] = availServsObjs;
          const discounts = Object.entries(discountsObjs).map(disc => disc[1]);
          const shippMthds = Object.entries(shippingMthdsObjs).map(method => method[1]);
          this.discountCodes = [...discounts];
          this.shippingMethods = [...shippMthds];
          return this.cartStateMgmnt.getCartItemsState();
        }),
        takeUntil(this.destroy$),
        switchMap(cartItms => {
          // console.log(cartItms);
          cartItms.forEach((itm) => {
            const { _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize, color, selectedColor, quantity, selectedQuantity, price, product, checked } = itm;
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
              product,
              checked
            });
            // console.log(this.cartItems);
            this.cartItems.push({ _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: selectedSize || '', color, selectedColor: selectedColor || '', quantity, selectedQuantity: selectedQuantity || 0, price, product, checked });
            // console.log(this.cartItems);
            this.itms.push(rowItm);
          });
          return this.cartStateMgmnt.getDiscountState();
        }),
        takeUntil(this.destroy$),
        switchMap(state => {
          const { code, rate } = state;
          // console.log(state);
          if (code !== discountInitialState.code) {
            this.discount.patchValue({ code, rate });
          }
          return this.cartStateMgmnt.getShippingState();
        }),
        takeUntil(this.destroy$),
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (state) => {
            this.loading = false;
            // console.log(state);
            console.log(this.errorsArr);
            const { name, value } = state;
            if (name !== shippingInitialState.name) {
              this.shipping.patchValue({ name, value });
            }
            if (this.itms.length) {
              this.subtotalCalc();
              this.discountCalc(undefined, this.subtotalValue || 0);
              this.totalCalc();
            }
          },
          error: (err) => {
            // console.log(err instanceof HttpErrorResponse);
            // console.log(err.message);
            this.loading = false;
            (err instanceof HttpErrorResponse) ? this.httpErrorsArr = [...this.httpErrorsArr, { ...err }] : null;
            (err instanceof Error) ? this.errorsArr = [...this.errorsArr, { ...err, message: err.message }] : null;
            // this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
            console.log(this.errorsArr);
          }
        }
      );
    this.unsubscriptionArray.push(cartSubscription);
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
        if (this.cartItems[idx].selectedColor != '') {
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
    this.destroy$.complete();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 4');
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
    this.cartItems[i] = { ...this.cartItems[i], checked: this.itms.controls[i].get('checked')?.value };
    // console.log(i);
    // console.log(this.listItems$[i]);
  }

  toggleSelectAll(): void {
    if (!this.cartItems.length) {
      return;
    }
    this.cartItems.forEach((itm, i) => {
      this.cartItems[i] = { ...itm, checked: !this.selectAllButtonStatement };
    });
    // console.log(this.listItems$);
    this.selectAllButtonStatement = !this.selectAllButtonStatement;
    // console.log(this.listItems$);
  }

  onRemoveSelected(): void {
    // console.log(this.listItems$);
    if (!this.cartItems.length) {
      return;
    }
    const notSelected = this.cartItems.filter((itm) => !itm.checked);
    const idxArr: number[] = [];
    this.cartItems.forEach((itm, idx) => {
      if (itm.checked) {
        idxArr.push(idx);
      }
    });
    for (let i = idxArr.length - 1; i >= 0; i--) {
      this.itms.removeAt(idxArr[i]);
    }
    // console.log(idxArr);
    // console.log(this.itms.value);
    this.cartItems = [...notSelected];
    this.subtotalCalc();
    this.discountCalc(undefined, this.subtotalValue);
    this.totalCalc();
    // this.cartItemsSubscription.unsubscribe();
    // this.cartSubscription.unsubscribe();
    this.destroySubsNotifier.destroy();
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
    this.cartItems[i] = { ...this.cartItems[i], selectedColor: this.itms.controls[i].get('selectedColor')?.value };
    // this.cartItemsSubscription.unsubscribe();
    // this.cartSubscription.unsubscribe();
    // console.log(color);
    this.destroySubsNotifier.destroy();
    this.cartService.updateCartItm(i, color, undefined, undefined);
  }

  onSizeChange(i: number): void {
    const selectedSize = this.itms.controls[i].get('selectedSize')?.value;
    // console.log(selectedSize);
    this.cartItems[i] = { ...this.cartItems[i], selectedSize: selectedSize };
    // this.cartItemsSubscription.unsubscribe();
    // this.cartSubscription.unsubscribe();
    this.destroySubsNotifier.destroy();
    this.cartService.updateCartItm(i, undefined, selectedSize, undefined);
  }
  onShippingChange(e: Event): void {
    const el = e.target as HTMLSelectElement;
    const idx = el.selectedIndex;
    // console.log(idx);
    const { name, value } = this.shippingMethods[idx];
    this.shipping.patchValue({ name, value });
    this.destroySubsNotifier.destroy();
    this.cartStateMgmnt.setShippingState(name, value);
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
      this.destroySubsNotifier.destroy();
      this.cartStateMgmnt.setDiscountState(code, rate);
      this.discountValue = this.subtotal.value * (rate || 0) / 100;
    } else if (subTotVal || subTotVal == 0) {
      console.log('SubTotalVal Invoked!', subTotVal);
      const rate = this.discount.value.rate || 0;
      this.discountValue = subTotVal * rate / 100;
    }
  }

  onSubmit() {
    // console.log(!this.listItems.length);
    if (!this.user) {
      throw new Error()
    }
    if (!this.user || this.form.invalid || !this.cartItems.length) {
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
    const status = 'pending';
    let orderId: string;

    this.cartService.placeOrder({ email, username, address, subtotal, discount, discountValue, shippingMethod, shippingValue, total, paymentState, status })
      .pipe(
        switchMap(dbOrder => {
          this.orderStateMgmnt.setDBOrderState({ ...dbOrder });
          orderId = dbOrder._id;
          return this.cartService.updateItmsRemainQty([...purchasedItems]);
        }),
        switchMap(() => {
          return this.cartService.createTradedItems([...purchasedItems], status, orderId);
        }),
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (dbTradedItms) => {
            // console.log(dbTradedItms);
            this.tradedItmsStateMgmnt.setDBTradedItemsState([...dbTradedItms]);
            this.router.navigate(['/checkout']);
          },
          error: err => {
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
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
    const newListItems = this.cartItems.filter((itm, idx) => idx != ItmIdx ? itm : null);
    this.cartItems = [...newListItems];
    // console.log(this.listItems);
    this.itms.removeAt(ItmIdx);
    this.subtotalCalc();
    this.discountCalc(undefined, this.subtotalValue);
    this.totalCalc();
    // this.cartItemsSubscription.unsubscribe();
    // this.cartSubscription.unsubscribe();
    this.destroySubsNotifier.destroy();
    this.cartService.removeCartItm(ItmIdx);
  }

  setProduct(i: number): void {/*///// -> triggered on Quantity changes/////*/
    // console.log(i);
    console.log('setProduct Invoked!');
    const selectedQuantity = this.itms.controls[i].get('selectedQuantity')?.value;
    const product = selectedQuantity * this.cartItems[i].price;
    this.cartItems[i] = { ...this.cartItems[i], selectedQuantity: selectedQuantity, product: product };
    this.itms.controls[i].patchValue({ product: product });
    // this.cartItemsSubscription.unsubscribe();
    // this.cartSubscription.unsubscribe();
    this.destroySubsNotifier.destroy();
    this.cartService.updateCartItm(i, undefined, undefined, selectedQuantity, product);
  }

  subtotalCalc(): void {
    console.log('subtotalCalc Invoked!');
    this.subtotal.setValue(this.cartItems.map(itm => itm.product).reduce((acc, currVal) => acc += currVal, 0));
    // console.log(subTotal);
  }

  totalCalc(): void {
    console.log('totalCalc invoked!');
    this.total.setValue(this.subtotalValue - this.discountValue + this.shippingValue);
  }

  logout(): void {
    this.userService.logout().pipe(
      catchError(err => { throw err; })
    ).subscribe(
      {
        next: () => {
          this.cartStateMgmnt.emptyCart();
          this.orderStateMgmnt.resetDBOrderState();
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
        }
      }
    );
  }

  public trackById(index: number, item: CartItem): string {
    // console.log(index);
    // console.log(item._id);
    return item._id;
  }
}
