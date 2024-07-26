import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShoppingCartDesktopComponent } from './shopping-cart-desktop/shopping-cart-desktop.component';
import { LoaderComponent } from './loader/loader.component';
import { ProductDetailsComponent } from './product-details/product-details.component';



@NgModule({
  declarations: [
    ShoppingCartDesktopComponent,
    LoaderComponent,
    ProductDetailsComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  exports: [ShoppingCartDesktopComponent, LoaderComponent, ProductDetailsComponent]
})
export class SharedModule { }
