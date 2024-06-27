import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShoppingCartDesktopComponent } from './shopping-cart-desktop/shopping-cart-desktop.component';



@NgModule({
  declarations: [
    ShoppingCartDesktopComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  exports: [ShoppingCartDesktopComponent]
})
export class SharedModule { }
