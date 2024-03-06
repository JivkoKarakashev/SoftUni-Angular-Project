import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';



@NgModule({
  declarations: [
    ShoppingCartComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[ShoppingCartComponent]
})
export class SharedModule { }
