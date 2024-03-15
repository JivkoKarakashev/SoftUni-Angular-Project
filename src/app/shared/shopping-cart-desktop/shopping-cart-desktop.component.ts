import { AfterViewInit, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';

import { Item } from 'src/app/types/item';
import { ShoesService } from 'src/app/shoes.service';
import { ShoppingCartService } from '../shopping-cart.service';

@Component({
  selector: 'app-shopping-cart-desktop',
  templateUrl: './shopping-cart-desktop.component.html',
  styleUrls: ['./shopping-cart-desktop.component.css']
})
export class ShoppingCartDesktopComponent implements OnInit, AfterViewInit {

  public listItems$: Item[] = [];

  constructor(private render: Renderer2, private shoesService: ShoesService, private location: Location, private cartService: ShoppingCartService) { }

  @ViewChild('modal') private modal!: ElementRef;
  @ViewChild('closeBtn') private closeBtn!: ElementRef;
  @ViewChild('checkItAll') private checkItAll!: ElementRef;
  @ViewChild('removeItems') private removeItems!: ElementRef;
  @ViewChildren('rows') private rows!: QueryList<ElementRef>;
  @ViewChildren('inputs') private inputs!: QueryList<ElementRef>;
  @ViewChildren('colorSelector') private colorSelector!: QueryList<ElementRef>;
  @ViewChildren('qty') private qty!: QueryList<ElementRef>;
  @ViewChildren('amounts') private amounts!: QueryList<ElementRef>;
  @ViewChild('subTotalEl') private subTotalEl!: ElementRef;
  @ViewChild('shipping') private shipping!: ElementRef;
  @ViewChild('discount') private discount!: ElementRef;
  @ViewChild('totalEl') private totalEl!: ElementRef;

  ngOnInit(): void {
    // this.shoesService.getShoes().subscribe(s => {
    //   this.listItems$ = s;
    // });
    this.cartService.getCartItems().subscribe(items => {
      this.listItems$ = items
    });
  }

  ngAfterViewInit(): void {
    this.render.listen(this.checkItAll.nativeElement, 'click', this.toggleSelect.bind(this));
    this.render.listen(this.removeItems.nativeElement, 'click', this.removeSelected.bind(this));
    this.render.listen(this.closeBtn.nativeElement, 'click', this.closeModal.bind(this));
    this.render.listen(this.modal.nativeElement, 'click', this.closeModal.bind(this));

    this.rows.changes.subscribe(() => {
      this.rows = this.rows;
      // console.log(this.rows.length);
    });
    
    this.colorSelector.changes.subscribe(() => {
      // console.log(this.colorSelector.toArray());
      this.colorSelector.toArray().forEach(selector => {
        this.render.listen(selector.nativeElement, 'change', this.changeColor.bind(this));
      });
    });

    this.qty.changes.subscribe(() => { 
      // console.log(this.qty.toArray());
      this.qty.toArray().forEach(qty => {
        this.render.listen(qty.nativeElement, 'change', this.amountsCalc.bind(this));
      });
    });

    this.amounts.changes.subscribe(() => {
      //  console.log(this.amounts.length);
      this.amountsCalc();
    })
  };

  closeModal(e: Event) {
    // console.log(e.target);
    e.stopPropagation();
    if (e.target == this.closeBtn.nativeElement || e.target == this.modal.nativeElement) {
      this.location.back();
    }
  }

  toggleSelect(e: Event) {
    // console.log(e.target);    
    if (this.checkItAll.nativeElement.checked) {
      this.inputs.toArray().forEach(input => {
        this.render.setProperty(input.nativeElement, 'checked', true);
      });
    } else {
      this.inputs.toArray().forEach(input => {
        this.render.setProperty(input.nativeElement, 'checked', false);
      });
    }
  }

  removeSelected(e: Event) {
    const selectedIds: string[] = this.rows.toArray().filter(r => r.nativeElement.children[0].children[0].checked).map(el => el.nativeElement.id);
    this.listItems$ = this.listItems$.filter(item => !selectedIds.includes(item._id));
    // console.log(this.listItems$);
    this.render.setProperty(this.checkItAll.nativeElement, 'checked', false);
  }

  amountsCalc() {
    this.rows.toArray().forEach(el => {
      // console.log(el.nativeElement);
      const qty = Number(el.nativeElement.children[3].children[1].value) || 1;
      const price = Number(el.nativeElement.children[4].textContent.split('$')[1]);
      const amount = el.nativeElement.children[5].textContent = `$${qty * price}`;
      // console.log(qty, price, amount);
    });
    this.cartCalc();
  }

  changeColor(e: Event): void {
    const el = e.target as HTMLSelectElement;
    const color = el.options[el.selectedIndex].text;
    this.render.setStyle(el, 'background-color', color);
    if (color == 'Black') {
      this.render.setStyle(el, 'color', 'white');
    } else {
      this.render.removeStyle(el, 'color');
    }
  }

  cartCalc() {
    const amountsArr = this.amounts.toArray().map(item => Number(item.nativeElement.textContent.split('$')[1]));
    // console.log(amountsArr);
    const subTotal = amountsArr.reduce((acc, currV) => acc += currV, 0).toFixed(2);
    // console.log(subTotal);
    const shippingPrice = Number(this.shipping.nativeElement.textContent?.split('$')[1]) || 0;
    const discountAmount = Number(this.discount.nativeElement.textContent?.split('$')[1]) || 0;
    this.subTotalEl.nativeElement.textContent = `$${subTotal}`;
    const sumTotal = (Number(subTotal) + shippingPrice - discountAmount).toFixed(2);
    // console.log(sumTotal);
    this.totalEl.nativeElement.textContent = `$${sumTotal}`;
  }
}
