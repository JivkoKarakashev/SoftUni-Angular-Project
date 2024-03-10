import { Component, OnInit, ViewChild } from '@angular/core';
// import { desktopModal } from '../../../scripts/desktop-shopping-cart';
import { ShoppingCartDesktopComponent } from 'src/app/shared/shopping-cart-desktop/shopping-cart-desktop.component';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {
  @ViewChild('modal') private modalCart!: ShoppingCartDesktopComponent;
  public isShown: boolean = false;
  
  ngOnInit(): void {
    // desktopModal();
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
