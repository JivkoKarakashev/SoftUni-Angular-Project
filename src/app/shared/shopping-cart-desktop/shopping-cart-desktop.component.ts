import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Item } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart.service';
import { Shipping } from 'src/app/types/shipping';
import { Discount } from 'src/app/types/discount';
import { InvertColor } from '../utils/invertColor';
import { CartItem } from 'src/app/types/cartItem';

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
  public subTotal$ = new BehaviorSubject<number>(0);

  public loading: boolean = true;

  public shippingMethods$: Shipping[] = [];
  public shippingValue: number = 0;
  public discountCodes$: Discount[] = [];
  public discountValue: number = 0;
  public availablePurchaseServices: (Discount & Shipping)[] = [];

  public total$: number = 0;

  public itmsArr: FormArray = this.fb.array([]);
  public form: FormGroup = this.fb.group({
    itms: this.itmsArr,
    shipping: ['', [Validators.required]],
    discount: ['', [Validators.required]],
  });

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder, private invertColor: InvertColor) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;

  @ViewChildren('optionElements') private optionElements!: QueryList<ElementRef>;

  @ViewChild('discount') private discount!: ElementRef;

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
    console.log('INITIALISED!')
    const availablePurchaseServicesSubscription = this.cartService.getAvailablePurchaseServices().subscribe(availServsObjs => {
      this.loading = false;
      let [discountsObjs, shippingMthdsObjs] = availServsObjs;
      // console.log(jacketsObjs, longwearObjs);      
      let discounts = Object.entries(discountsObjs).map(disc => disc[1]);
      let shippMthds = Object.entries(shippingMthdsObjs).map(method => method[1]);
      // console.log(discounts);
      // console.log(shippMthds);
      // console.log(shippMthds instanceof(Array));
      // this.listItems$ = Object.values(shippMthds);
      // console.log(Object.values(shippMthds));
      this.discountCodes$ = discounts;
      this.shippingMethods$ = shippMthds;
    });
    this.unsubscriptionArray.push(availablePurchaseServicesSubscription);

    this.cartItemsSubscription = this.cartService.items$.subscribe(items => {
      items.forEach((itm, index) => {
        const { _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, color, quantity, price } = itm;
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
          selectedSize: ['', [Validators.required,]],
          color: [color],
          selectedColor: ['', [Validators.required,]],
          quantity,
          selectedQuantity: ['', [Validators.required,]],
          price,
          buyed: itm?.buyed,
          product: 0,
          checked: false
        });
        this.listItems$.push({ _id, _ownerId, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false });
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

    const subTotalSubscription = this.subTotal$.subscribe((val) => {
      this.getDiscount(undefined, val | 0);
    });
    this.unsubscriptionArray.push(subTotalSubscription);

    this.itms.controls.forEach((itm, i) => {
      const valueChangeSub = itm.get('product')?.valueChanges.subscribe(val => {
        // console.log(`${val} at index:${i}`);
        if (val) {
          // this.subTotal = this.getSubtotal();          
          // console.log(this.subTotal);
          this.subTotal$.next(this.getSubtotal());
          // console.log(this.subTotal$$);
          this.total$ = this.getTotal();
        }
      }) as Subscription;
      this.unsubscriptionArray.push(valueChangeSub);
    });
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

  removeSelected(): void {
    // console.log(this.listItems$);
    if (!this.listItems$.length) {
      return;
    }
    const ids = this.listItems$.filter(itm => itm.checked).map(itm => itm._id);
    const notSelected = this.listItems$.filter((itm) => !itm.checked);
    const idxArr: number[] = [];
    this.listItems$.forEach((itm, idx) => {
      if (itm.checked) {
        idxArr.push(idx);
        // this.itms.removeAt(idx);
      }
    });
    for (let i = idxArr.length - 1; i >= 0; i--) {
      this.itms.removeAt(idxArr[i]);
    }
    this.listItems$ = notSelected;
    this.subTotal$.next(this.getSubtotal());
    this.total$ = (this.getTotal());
    // console.log(idxArr);
    // console.log(this.itms.value);
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItems(ids);
  }

  selectColor(e: Event, i: number): void {
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
    // this.listItems$[i].selectedColor = this.itms.controls[i].get('selectedColor')?.value;
    // console.log(this.listItems$[i].selectedColor);
    // console.log(this.listItems$);
  }

  selectSize(i: number): void {
    this.listItems$[i] = { ...this.listItems$[i], selectedSize: this.itms.controls[i].get('selectedSize')?.value};
  }
  selectShipping(): void {
    this.shippingValue = this.shippingVal;
    // console.log(this.shippingVal);
    this.total$ = this.getTotal();
  }
  getDiscount(e?: Event, subTotVal?: number): void {
    console.log('Event Invoked!: ', e?.target as HTMLSelectElement);
    console.log('SubTotalVal Invoked!', subTotVal);
    if (e) {
      const el = e.target as HTMLSelectElement;
      const discountRate = Number(el.value);
      const discountValue = this.subTotal$.value * discountRate / 100;
      this.discountValue = discountValue;
      this.total$ = this.getTotal();
    } else if (subTotVal) {
      const discountRate = this.discount.nativeElement.value || 0;
      this.discountValue = subTotVal * discountRate / 100;
    }
  }

  purchase() {
    console.log(!this.listItems$.length);
    if (this.form.invalid || !this.listItems$.length) {
      return;
    }
    console.log(this.form.value);
    console.log(this.listItems$);
    console.log(this.form.get('itms')?.value);
    console.log(this.subTotal$.value);
    console.log(this.discountValue);
    console.log(this.form.get('shipping')?.value);
    console.log(this.total$);
  }

  removeItm(ItmIdx: number) {
    // console.log(this.listItems$);
    const newListItems = this.listItems$.filter((itm, idx) => idx != ItmIdx ? itm : null);
    this.listItems$ = newListItems;
    // console.log(this.listItems$);
    this.itms.removeAt(ItmIdx);
    this.subTotal$.next(this.getSubtotal());
    // console.log(this.subTotal$);
    this.total$ = this.getTotal();
    // console.log(this.total$);
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItm(ItmIdx);
  }

  getProduct(i: number): number {
    // console.log(i);
    this.listItems$[i] = {...this.listItems$[i], selectedQuantity: this.itms.controls[i].get('selectedQuantity')?.value };
    const product = this.listItems$[i].product = this.listItems$[i].selectedQuantity * this.listItems$[i].price;
    this.itms.controls[i].patchValue({ product: product });
    return product;
  }

  getSubtotal(): number {
    console.log('Subtotal Invokde!');
    const subTotal = this.listItems$.map(itm => itm.product).reduce((acc, currVal) => acc += currVal, 0);
    // console.log(subTotal);
    return subTotal;
  }

  getTotal(): number {
    // console.log(`subTotal: ${this.subTotal$.value}`);
    // console.log(`discount: ${this.discountValue}`);
    // console.log(`Shipping:  ${this.shippingValue}`);
    console.log('getTotal invoked!');
    const total = this.total$ = this.subTotal$.value - this.discountValue + this.shippingValue;
    return total;
  }

  public trackById(index: number, item: CartItem): string {
    // console.log(index);
    // console.log(item._id);
    return item._id;
  }
}
