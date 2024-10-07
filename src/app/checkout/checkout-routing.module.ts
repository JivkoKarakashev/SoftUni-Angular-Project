import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CheckoutComponent } from './checkout/checkout.component';
import { ConfirmOrderComponent } from './confirm-order/confirm-order.component';

const routes: Routes = [
  { path: 'checkout', loadChildren: () => import('../checkout/checkout.module').then(m => m.CheckoutModule), component: CheckoutComponent },
  { path: 'checkout/confirm-order', component: ConfirmOrderComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
