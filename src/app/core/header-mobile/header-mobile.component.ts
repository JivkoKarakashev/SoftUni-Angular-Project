import { Component, OnInit, ViewChild } from '@angular/core';
// import { mobileModal } from 'src/scripts/mobile-shopping-cart';
import { ShoppingCartMobileComponent } from 'src/app/shared/shopping-cart-mobile/shopping-cart-mobile.component';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css']
})
export class HeaderMobileComponent implements OnInit {
  @ViewChild('modal') private modalCart!: ShoppingCartMobileComponent;
  public isShown: boolean = false;

  ngOnInit(): void {
    // mobileModal();
  }

  modalCartCalc() {
    this.modalCart.cartCalc();   
  }

  modalToggle(): void {
    // console.log('HERE');    
    this.isShown = !this.isShown;
    this.modalCartCalc();
    // console.log(this.isShown);    
    // return this.isShown;
  }
}
