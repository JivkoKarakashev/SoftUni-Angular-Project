import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, FormControl, NgForm, Validators, AbstractControl } from '@angular/forms';

import { Item } from 'src/app/types/item';
import { ShoppingCartService } from '../shopping-cart.service';

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

  public itmsArr: FormArray = this.fb.array([]);
  public form: FormGroup = this.fb.group({
    itms: this.itmsArr
  });

  constructor(private render: Renderer2, private location: Location, private cartService: ShoppingCartService, private fb: FormBuilder) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;
  @ViewChild('checkItAll') private checkItAll!: ElementRef;
  @ViewChild('removeItems') private removeItems!: ElementRef;
  @ViewChildren('rows') private rows!: QueryList<ElementRef>;
  @ViewChildren('imgUrl') private imgUrl!: QueryList<ElementRef>;
  @ViewChildren('inputs') private inputs!: QueryList<ElementRef>;
  @ViewChildren('amounts') private amounts!: QueryList<ElementRef>;
  @ViewChild('subTotalEl') private subTotalEl!: ElementRef;
  @ViewChild('shipping') private shipping!: ElementRef;
  @ViewChild('discount') private discount!: ElementRef;
  @ViewChild('totalEl') private totalEl!: ElementRef;

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
          product: [''],
          checked: false
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
    });
    this.selectAllButtonStatement = !this.selectAllButtonStatement;
  }

  // removeSelected(e: Event) {
  //   const selectedIds: string[] = this.rows.toArray().filter(r => r.nativeElement.children[0].children[0].checked).map(el => el.nativeElement.id);
  //   // this.listItems$ = this.listItems$.filter(item => !selectedIds.includes(item._id));
  //   // console.log(this.listItems$);
  //   this.cartService.removeCartItems(selectedIds);
  //   this.render.setProperty(this.checkItAll.nativeElement, 'checked', false);
  // }
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
  }

  // amountsCalc() {
  //   this.rows.toArray().forEach(el => {
  //     // console.log(el.nativeElement);
  //     const qty = Number(el.nativeElement.children[3].children[1].value) || 1;
  //     const price = Number(el.nativeElement.children[4].textContent.split('$')[1]);
  //     const amount = el.nativeElement.children[5].textContent = `$${qty * price}`;
  //     // console.log(qty, price, amount);
  //   });
  //   this.cartCalc();
  // }

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

  }

  // changeQuantity(e: Event): void {
  //   this.amountsCalc();
  // }

  // cartCalc() {
  //   const amountsArr = this.amounts.toArray().map(item => Number(item.nativeElement.textContent.split('$')[1]));
  //   // console.log(amountsArr);
  //   const subTotal = amountsArr.reduce((acc, currV) => acc += currV, 0).toFixed(2);
  //   // console.log(subTotal);
  //   const shippingPrice = Number(this.shipping.nativeElement.textContent?.split('$')[1]) || 0;
  //   const discountAmount = Number(this.discount.nativeElement.textContent?.split('$')[1]) || 0;
  //   this.subTotalEl.nativeElement.textContent = `$${subTotal}`;
  //   const sumTotal = (Number(subTotal) + shippingPrice - discountAmount).toFixed(2);
  //   // console.log(sumTotal);
  //   this.totalEl.nativeElement.textContent = `$${sumTotal}`;
  // }

  purchase() {
    // const { imgUrl } = purchaseForm.form.value;
    // console.log(this.imgUrl.toArray().map(obj => obj.nativeElement.value));
    // console.log(this.rows.toArray().map(row => row.nativeElement));
    console.log(this.form.value);
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[1].value)); //imgUrl
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[2].value)); //descrip
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[3].value)); //color
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[4].value)); //size
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[5].value)); //quantity
    // console.log(this.rows.toArray().map(row => row.nativeElement.children[6].value)); //price
  }

  // toggle(event: Event) {
  //   // console.log(event.target);
  //   const target = event.target as HTMLElement;
  //   // this.selectedRowImgUrl = itm.image;
  //   // console.log(itm.image);
  // }

  get itms() {
    return this.form.controls["itms"] as FormArray;
  }

  removeItm(ItmIdx: number) {
    this.itms.removeAt(ItmIdx);
    // this.unsubscriptionArray.forEach((subscription) => {
    //   subscription.unsubscribe()});
    this.cartItemsSubscription.unsubscribe();
    this.cartService.removeCartItm(ItmIdx);
  }

  getProduct(itm: AbstractControl, i: number): number {
    // console.log(itm);
    // console.log(typeof(itm));
    const qty = itm.get('selectedQuantity')?.value;
    const price = itm.get('price')?.value;
    const product = Number(qty) * Number(price);
    this.itms.controls[i].patchValue({ product: product });
    return product;
    // console.log(itm.get('selectedQuantity')?.value);
    // console.log(itm.get('price')?.value);
  }
}
