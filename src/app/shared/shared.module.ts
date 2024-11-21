import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { LoaderComponent } from './loader/loader.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CheckoutRoutingModule } from '../checkout/checkout-routing.module';
import { ErrorsComponent } from './errors/errors.component';



@NgModule({
  declarations: [
    ShoppingCartComponent,
    LoaderComponent,
    ProductDetailsComponent,
    ErrorsComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CheckoutRoutingModule, NgxStripeModule.forChild(environment.stripe.publicKey)
  ],
  exports: [ShoppingCartComponent, LoaderComponent, ProductDetailsComponent, ErrorsComponent]
})
export class SharedModule { }
