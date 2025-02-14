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
import { Error404Component } from './error-404/error-404.component';
import { TrimDirective } from './directives/trim.directive';
import { RelatedProductsComponent } from './related-products/related-products.component';
import { NgConfirmModule } from 'ng-confirm-box';



@NgModule({
  declarations: [
    ShoppingCartComponent,
    LoaderComponent,
    ProductDetailsComponent,
    ErrorsComponent,
    Error404Component,
    TrimDirective,
    RelatedProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    CheckoutRoutingModule,
    NgxStripeModule.forChild(environment.stripe.publicKey),
    NgConfirmModule
  ],
  exports: [ShoppingCartComponent, LoaderComponent, ProductDetailsComponent, ErrorsComponent, TrimDirective]
})
export class SharedModule { }
