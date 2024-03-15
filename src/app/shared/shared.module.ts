import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartDesktopComponent } from './shopping-cart-desktop/shopping-cart-desktop.component';
import { ShoppingCartMobileComponent } from './shopping-cart-mobile/shopping-cart-mobile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ShoppingCartDesktopComponent,
    ShoppingCartMobileComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  exports: [ShoppingCartDesktopComponent, ShoppingCartMobileComponent]
})
export class SharedModule { }
