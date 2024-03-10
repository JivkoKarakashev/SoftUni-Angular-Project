import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';

interface item {
  id: string,
  img: string,
  description: string,
  color: string,
  quantity: number,
  price: number,
}

@Component({
  selector: 'app-shopping-cart-mobile',
  templateUrl: './shopping-cart-mobile.component.html',
  styleUrls: ['./shopping-cart-mobile.component.css']
})
export class ShoppingCartMobileComponent implements AfterViewInit {

  public listItems$: item[] = [
    {
      id: '1',
      img: '../../../assets/public/static/images/shoes/image1.jpg',
      description: 'Wireless Headphones with Noise Cancellation Tru Bass Bluetooth HiFi',
      color: 'White',
      quantity: 1,
      price: 50
    },
    {
      id: '2',
      img: '../../../assets/public/static/images/shoes/image2.jpg',
      description: 'Wireless Headphones with Noise Cancellation Tru Bass Bluetooth HiFi',
      color: 'Red',
      quantity: 1,
      price: 40
    },
  ];

  constructor() {}

  @Input() public curStatus: boolean = false;
  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;
  @ViewChildren('inputs') private inputs!: QueryList<ElementRef>;
  @ViewChildren('rows') private rows!: QueryList<ElementRef>;
  @ViewChild('checkItAll') private checkItAll!: ElementRef;
  // @ViewChild('table') private table!: ElementRef;
  @ViewChild('subTotalEl') private subTotalEl!: ElementRef;
  @ViewChild('shipping') private shipping!: ElementRef;
  @ViewChild('discount') private discount!: ElementRef;
  @ViewChild('totalEl') private totalEl!: ElementRef;

  @Output('closeModal') private toggleModal = new EventEmitter<any>();

  ngAfterViewInit(): void {
    // console.log(this.modalToggle);
    
    // console.log(this.inputs.toArray());
    // console.log(this.rows.toArray());
    // console.log(this.checkItAll.nativeElement);
    // console.log(this.table.nativeElement);
    // console.log(this.subTotalEl.nativeElement);
    // console.log(this.shipping.nativeElement);
    // console.log(this.discount.nativeElement);
    // console.log(this.totalEl.nativeElement);

    this.inputs.changes.subscribe((i) => {
      // console.log(i);      
      // console.log("Inputs CHANGE");
      this.cartCalc();
    });
    this.rows.changes.subscribe((r) => {
      // console.log(r);      
      // console.log("Rows CHANGE");
    });
  }

  toggleSelect() {
    const inputEls = this.inputs.toArray();
    if (this.checkItAll.nativeElement.checked) {
      inputEls.forEach(input => {
        input.nativeElement.checked = true;
      });
    } else {
      inputEls.forEach(input => {
        input.nativeElement.checked = false;
      });
    }
  }

  removeSelected() {
    // const checked = inputs.filter((item) => item.checked == true);
    this.rows.toArray().forEach((item, index) => {
      if ((item.nativeElement.children[0].children[0]).checked == true) {
        item.nativeElement.remove();
        this.listItems$.splice(index, 1);
      }
    });
    // console.log(this.listItems$);
    // console.log(this.rows);

    this.checkItAll.nativeElement.checked = false;
  }
  
  cartCalc() {

    const values = this.listItems$.map(item => item.price);
    const subTotal = values.reduce((acc, currV) => acc += currV, 0).toFixed(2);
    // console.log(subTotal);
    const shippingPrice = Number(this.shipping.nativeElement.textContent?.split('$')[1]) || 0;
    const discountAmount = Number(this.discount.nativeElement.textContent?.split('-$')[1]) || 0;
    this.subTotalEl.nativeElement.textContent = `$${subTotal}`;
    const sumTotal = (Number(subTotal) + shippingPrice - discountAmount).toFixed(2);
    // console.log(sumTotal);
    this.totalEl.nativeElement.textContent = `$${sumTotal}`;
  }

  callParent(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    // console.log(event.target == this.desktopModal.nativeElement);
    // console.log(event.target == this.closeBtn.nativeElement);
    // console.log(target);    
    if (target == this.modal.nativeElement || target == this.closeBtn.nativeElement) {
      this.toggleModal.emit();
    }
  }
}
