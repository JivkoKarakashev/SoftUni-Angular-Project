import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ShoppingCartDesktopComponent } from './shopping-cart-desktop/shopping-cart-desktop.component';
import { LoaderComponent } from './loader/loader.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CheckoutRoutingModule } from '../checkout/checkout-routing.module';



@NgModule({
  declarations: [
    ShoppingCartDesktopComponent,
    LoaderComponent,
    ProductDetailsComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CheckoutRoutingModule, NgxStripeModule.forChild(environment.stripe.publicKey)
  ],
  exports: [ShoppingCartDesktopComponent, LoaderComponent, ProductDetailsComponent]
})
export class SharedModule { }
