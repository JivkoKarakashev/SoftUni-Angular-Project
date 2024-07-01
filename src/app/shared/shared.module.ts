import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShoppingCartDesktopComponent } from './shopping-cart-desktop/shopping-cart-desktop.component';
import { LoaderComponent } from './loader/loader.component';



@NgModule({
  declarations: [
    ShoppingCartDesktopComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  exports: [ShoppingCartDesktopComponent, LoaderComponent]
})
export class SharedModule { }
