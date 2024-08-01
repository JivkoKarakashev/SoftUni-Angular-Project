import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { Item } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart.service';
import { Shipping } from 'src/app/types/shipping';
import { Discount } from 'src/app/types/discount';
import { InvertColor } from '../utils/invertColor';

type MyVoid = () => void;

@Component({
  selector: 'app-shopping-cart-desktop',
  templateUrl: './shopping-cart-desktop.component.html',
  styleUrls: ['./shopping-cart-desktop.component.css'],
})
export class ShoppingCartDesktopComponent implements OnInit, AfterViewInit, OnDestroy {

  public listItems$: Item[] = [];
  public selectAllButtonStatement: boolean = false;
  private unsubscriptionArray: Subscription[] = [];
  private cartItemsSubscription: Subscription = new Subscription;
  private optionElementsSubscription: Subscription = new Subscription;
  private unsubscriptionEventsArray: MyVoid[] = [];
  public subTotal$$ = new BehaviorSubject<number>(0);
  private subTotalSubscription: Subscription = new Subscription;
  public loading: boolean = true;
  
  public shippingMethods$: Shipping[] = [];
  public shippingValue: number = 0;
  public discountCodes$: Discount[] = [];
  public discountValue: number = 0;
  public availablePurchaseServices: (Discount & Shipping)[] = [];
  private availablePurchaseServicesSubscription: Subscription = new Subscription;
  
  public total: Number = 0;

  public itmsArr: FormArray = this.fb.array([]);
  public form: FormGroup = this.fb.group({
    itms: this.itmsArr,
    shipping: ['', [Validators.required]],
    discount: ['', [Validators.required]],
  });

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder, private invertColor: InvertColor) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;
  
  @ViewChildren('optionElements') private  optionElements!: QueryList<ElementRef>;

  @ViewChild('discount') private discount!: ElementRef;
  @ViewChild('totalEl') private totalEl!: ElementRef;

  get itms() {
    return this.form.controls["itms"] as FormArray;
  }
  get shipping() {
    return this.form.controls["shipping"] as FormArray;
  }

  ngOnInit(): void {
    this.availablePurchaseServicesSubscription = this.cartService.getAvailablePurchaseServices().subscribe(availServsObjs => {
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
    this.unsubscriptionArray.push(this.availablePurchaseServicesSubscription);
    
    this.cartItemsSubscription = this.cartService.items$.subscribe(items => {
      items.forEach((itm, index) => {
        const rowItm = this.fb.group({
          _id: [itm._id],
          _ownerId: [itm._ownerId],
          // _createdOn: [itm._createdOn],
          image: [itm.image],
          // altImages:[itm.altImages],
          // cat:[itm.cat],
          // subCat:[itm.subCat],
          description: [itm.description],
          // brand: [itm.brand],
          sizes: [itm.size],
          selectedSize: ['', [Validators.required,]],
          colors: [itm.color],
          selectedColor: ['', [Validators.required,]],
          quantity: [itm.quantity],
          selectedQuantity: ['', [Validators.required,]],
          price: [itm.price],
          buyed: [itm?.buyed],
          product: [0],
          checked: [false]
        });
        this.itms.push(rowItm);
      });
      // console.log(this.itms.value);
      // this.listItems$ = items;
      // console.log(this.listItems$);
      // console.log(this.itms);
    });
    this.unsubscriptionArray.push(this.cartItemsSubscription);
    // console.log(this.unsubscriptionArray);

    this.subTotalSubscription = this.subTotal$$.subscribe((val) => {
      // console.log(val)
      if(val === 0) {
        this.discountValue = 0;
        // console.log('invoked subTotal change with 0.00 VALUE');
      } else {
        this.getDiscount(undefined, val);
      }
    });
    this.unsubscriptionArray.push(this.subTotalSubscription);

    this.itms.controls.forEach((itm, i) => {      
      const valueChangeSub = itm.get('product')?.valueChanges.subscribe(val => {
        // console.log(`${val} at index:${i}`);
        if (val) {
          // this.subTotal = this.getSubtotal();          
          // console.log(this.subTotal);
          this.subTotal$$.next(this.getSubtotal());
          // console.log(this.subTotal$$);
          this.getTotal();
        }
      }) as Subscription;
      this.unsubscriptionArray.push(valueChangeSub);
    });
  }

  ngAfterViewInit(): void {
    const closeModalBtnEvent = this.render.listen(this.closeBtn.nativeElement, 'click', this.closeModal.bind(this));
    const closeModalEvent = this.render.listen(this.modal.nativeElement, 'click', this.closeModal.bind(this));
    this.unsubscriptionEventsArray.push(closeModalBtnEvent, closeModalEvent);

    this.optionElementsSubscription = this.optionElements.changes.subscribe((els: QueryList<ElementRef>) => {
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
    this.unsubscriptionArray.push(this.optionElementsSubscription);
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

  toggleSelectAll(): void {
    if (!this.itmsArr.length) {
      return;
    }
    this.itms.controls.forEach(itm => {
      itm.patchValue({ checked: !this.selectAllButtonStatement });
      // console.log(itm);
    });
    this.selectAllButtonStatement = !this.selectAllButtonStatement;
  }

  removeSelected(): void {
    const idxArr: number[] = [];
    const slectedItms: AbstractControl[] = this.itms.controls.filter((itm, index)=> {
      if (itm.get('checked')?.value == true) {
        idxArr.push(index);
      }
      return itm.get('checked')?.value == true;
    });
    // console.log(slectedItms);
    // console.log(idxArr);
    for (let i = idxArr.length - 1; i >= 0; i--) {
      this.removeItm(idxArr[i]);
    }
    // this.subTotal = this.getSubtotal();
    // this.subTotal$$.next(this.getSubtotal());
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
      this.render.setStyle(el, 'background-color',  color);
      this.render.setStyle(el, 'color', hexColor);      
    }
    else {
      this.render.removeStyle(el, 'background-color');
      this.render.removeStyle(el, 'color'); 
    }
  }

  selectSize(e: Event, i: number): void {
    const el = e.target as HTMLSelectElement;
    // const size = el.options[el.selectedIndex].text;
    const size = el.value;
    // this.itms.controls[i].get('selectedSize')?.patchValue(size);
    // this.itms.controls[i].patchValue({ selectedSize: size });
    // console.log(this.itms.value);
    // console.log(this.itms.controls[i]);
    // console.log(i);
    // console.log(this.selectedSize);
    // console.log(this.itms.controls[i].get('selectedSize')?.value);
    // console.log(this.itms.controls[i].get('size')?.value);
  }
  selectShipping(e: Event): void {
    const el = e.target as HTMLSelectElement;
    // const shipping = el.options[el.selectedIndex].text;
    this.shippingValue = Number(el.value);
    this.getTotal();
  }
  getDiscount(e?: Event, subTotVal?: number): void {
    if (e) {
      const el = e.target as HTMLSelectElement;
      // const shipping = el.options[el.selectedIndex].text;
      const discountRate = Number(el.value);
      // const discountValue = this.subTotal * discountRate / 100;
      const discountValue = this.subTotal$$.value * discountRate / 100;
      this.discountValue = discountValue;
      // console.log('invoked getDiscout method with $EVENT parameter');
      this.getTotal();
    }else if(subTotVal) {
      setTimeout(() => {
        // console.log(Number(this.subTotalEl.nativeElement.textContent?.split('$')[1]) || 0);
      })
      // console.log(subTotVal);
      // console.log('invoked getDiscout method with subTotalVal parameter');
      // console.log(this.discount.nativeElement.value || 0);
      const discountRate = this.discount.nativeElement.value || 0;
      this.discountValue = subTotVal * discountRate / 100;
    }
  }

  purchase() {
    if (this.form.invalid) {    
      return;
    }
    console.log(this.form.value);
    console.log(this.form.get('itms'));
    console.log(this.form.get('shipping')?.value);
  }

  removeItm(ItmIdx: number) {
    this.itms.removeAt(ItmIdx);
    // this.subTotal = this.getSubtotal();
    this.subTotal$$.next(this.getSubtotal());
    this.getTotal();
    // this.unsubscriptionArray.forEach((subscription) => {
    // subscription.unsubscribe()});
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItm(ItmIdx);
  }

  getProduct(itm: AbstractControl): number {
      // console.log(itm);
      // console.log(typeof(itm));
      const qty = itm.get('selectedQuantity')?.value;
      const price = itm.get('price')?.value;
      const product = Number(qty) * Number(price);
      itm.patchValue({product: product});
      // console.log('here');
      // console.log(itm.get('selectedQuantity')?.value);
      // console.log(itm.get('price')?.value);
      // console.log(itm.get('product')?.value);
      return product;
  }

  getSubtotal(): number {
    return this.itms.controls.map(itm => itm.get('product')?.value).reduce((acc, currVal) => acc += currVal, 0);
  }

  getTotal(): void {
    // console.log(`subTotal: ${this.subTotal$$.value}`);
    // console.log(`discount: ${this.discountValue}`);
    // console.log(`Shipping:  ${this.shippingValue}`);
    this.total = this.subTotal$$.value - this.discountValue + this.shippingValue;
    console.log('getTotal invoked!');
  }

  public trackById(index: number, item: AbstractControl): string {
    // console.log(item.get('_id')?.value);
    return item.get('_id')?.value;
  }
}
