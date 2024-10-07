import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { CheckoutComponent } from '../checkout/checkout/checkout.component';
import { ConfirmOrderComponent } from './confirm-order/confirm-order.component';



@NgModule({
  declarations: [
    CheckoutComponent,
    ConfirmOrderComponent
  ],
  imports: [
    CommonModule, RouterModule, SharedModule
  ]
})
export class CheckoutModule { }
