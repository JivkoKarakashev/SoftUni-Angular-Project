import { AfterContentInit, AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, FormControl, NgForm, Validators, AbstractControl } from '@angular/forms';

import { Item } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart.service';
import { Shipping } from 'src/app/types/shipping';
import { Discount } from 'src/app/types/discount';

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
  private unsubscriptionEventsArray: MyVoid[] = [];
  public subTotal$$ = new BehaviorSubject<number>(0);
  private subTotalSubscription: Subscription = new Subscription;
  public shippingMethods: Shipping[] = [
    {
      name: 'economic',
      value: 7
    },
    {
      name: 'standard',
      value: 10
    },
    {
      name: 'premium',
      value: 15
    }
  ];
  public shippingValue: number = 0;
  public discountCodes: Discount[] = [
    {
      code: 'WINTERSALE',
      rate: 25
    },
    {
      code: 'SPRINGSALE',
      rate: 10
    },
    {
      code: 'EASTERSALE',
      rate: 50
    },
    {
      code: 'SUMMERSALE',
      rate: 25
    },
    {
      code: 'AUTUMNSALE',
      rate: 15
    },
    {
      code: 'NEWYEARSALE',
      rate: 50
    }
  ];
  public discountValue: number = 0;

  public itmsArr: FormArray = this.fb.array([]);
  public form: FormGroup = this.fb.group({
    itms: this.itmsArr,
    shipping: ['', [Validators.required]],
    discount: ['', [Validators.required]],
  });

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;
  // @ViewChild('checkItAll') private checkItAll!: ElementRef;
  // @ViewChild('removeItems') private removeItems!: ElementRef;
  // @ViewChildren('rows') private rows!: QueryList<ElementRef>;
  // @ViewChildren('imgUrl') private imgUrl!: QueryList<ElementRef>;
  // @ViewChildren('inputs') private inputs!: QueryList<ElementRef>;
  // @ViewChildren('amounts') private amounts!: QueryList<ElementRef>;
  @ViewChild('subTotalEl') private subTotalEl!: ElementRef;
  // @ViewChild('shipping') private shipping!: ElementRef;
  @ViewChild('discount') private discount!: ElementRef;
  @ViewChild('totalEl') private totalEl!: ElementRef;

  get itms() {
    return this.form.controls["itms"] as FormArray;
  }
  get shipping() {
    return this.form.controls["shipping"] as FormArray;
  }

  ngOnInit(): void {
    this.cartItemsSubscription = this.cartService.items$.subscribe(items => {
      items.forEach((itm, index) => {
        const rowItm = this.fb.group({
          _id: [itm._id, [Validators.required,]],
          _ownerId: [itm._ownerId, [Validators.required,]],
          image: [itm.image, [Validators.required,]],
          description: [itm.description, [Validators.required,]],
          sizes: [itm.size, [Validators.required,]],
          selectedSize: ['', [Validators.required,]],
          colors: [itm.color, [Validators.required,]],
          selectedColor: ['', [Validators.required,]],
          quantity: [itm.quantity, [Validators.required,]],
          selectedQuantity: ['', [Validators.required,]],
          price: [itm.price, [Validators.required,]],
          buyed: [itm?.buyed,],
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
        console.log('invoked subTotal change with 0.00 VALUE');
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
        }
      }) as Subscription;
      this.unsubscriptionArray.push(valueChangeSub);
    });

    // this.shippingMethods.forEach(method => {
    //   const methodCtrl = this.fb.group({
    //     image: [method.name, [Validators.required,]],
    //     description: [method.value, [Validators.required,]],
    //   });
    //   this.shipping.push(methodCtrl);
    // })
  }

  ngAfterViewInit(): void {
    // const selectToggleEvent = this.render.listen(this.checkItAll.nativeElement, 'click', this.toggleSelect.bind(this));
    // const removeSelectedEvent = this.render.listen(this.removeItems.nativeElement, 'click', this.removeSelected.bind(this));
    const closeModalBtnEvent = this.render.listen(this.closeBtn.nativeElement, 'click', this.closeModal.bind(this));
    const closeModalEvent = this.render.listen(this.modal.nativeElement, 'click', this.closeModal.bind(this));
    this.unsubscriptionEventsArray.push(/*selectToggleEvent, removeSelectedEvent,*/ closeModalBtnEvent, closeModalEvent);
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
    // this.itms.controls[i].get('selectedColor')?.patchValue(color);
    // this.itms.controls[i].patchValue({ selectedColor: color });
    // console.log(this.itms.value);
    // console.log(this.itms.controls[i]);
    // console.log(i);
    // console.log(this.selectedColor);
    // console.log(this.itms.controls[i].get('selectedColor')?.value);
    // console.log(this.itms.controls[i].get('color')?.value);
    this.render.setStyle(el, 'background-color', color);
    if (color == 'Black' || color == 'Gray' || color == 'Brown' || color == 'Red' || color == 'Green' || color == 'Blue') {
      this.render.setStyle(el, 'color', 'white');
    } else {
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
  }
  getDiscount(e?: Event, subTotVal?: number): void {
    if (e) {
      const el = e.target as HTMLSelectElement;
      // const shipping = el.options[el.selectedIndex].text;
      const discountRate = Number(el.value);
      // const discountValue = this.subTotal * discountRate / 100;
      const discountValue = this.subTotal$$.value * discountRate / 100;
      this.discountValue = discountValue;
      console.log('invoked getDiscout method with $EVENT parameter');
    }else if(subTotVal) {
      setTimeout(() => {
        // console.log(Number(this.subTotalEl.nativeElement.textContent?.split('$')[1]) || 0);
      })
      // console.log(subTotVal);
      console.log('invoked getDiscout method with subTotalVal parameter');
      // console.log(this.discount.nativeElement.value || 0);
      const discountRate = this.discount.nativeElement.value || 0;
      this.discountValue = subTotVal * discountRate / 100;
    }
  }

  // onQuantityChange(itm: AbstractControl): void {
  //   this.getProduct(itm);
  //   this.getDiscount();
  // }

  purchase() {
    // const { imgUrl } = purchaseForm.form.value;
    // console.log(this.imgUrl.toArray().map(obj => obj.nativeElement.value));
    // console.log(this.rows.toArray().map(row => row.nativeElement));
    console.log(this.form.value);
    console.log(this.form.get('itms'));
    console.log(this.form.get('shipping')?.value);
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[1].value)); //imgUrl
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[2].value)); //descrip
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[3].value)); //color
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[4].value)); //size
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[5].value)); //quantity
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[6].value)); //price
  }

  removeItm(ItmIdx: number) {
    this.itms.removeAt(ItmIdx);
    // this.subTotal = this.getSubtotal();
    this.subTotal$$.next(this.getSubtotal());
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
}
