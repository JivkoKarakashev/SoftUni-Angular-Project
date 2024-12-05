import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../shared/shared.module';

import { ProfileComponent } from './profile.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { OverviewComponent } from './overview/overview.component';
import { SalesComponent } from './sales/sales.component';



@NgModule({
  declarations: [
    ProfileComponent,
    OverviewComponent,
    PurchasesComponent,
    SalesComponent
  ],
  imports: [
    CommonModule, ProfileRoutingModule, SharedModule, CanvasJSAngularChartsModule
  ]
})
export class ProfileModule { }
