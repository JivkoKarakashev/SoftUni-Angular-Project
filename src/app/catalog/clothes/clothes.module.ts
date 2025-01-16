import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JacketsComponent } from './jackets/jackets.component';
import { LongwearComponent } from './longwear/longwear.component';
import { ClothesComponent } from './clothes/clothes.component';
import { ClothesRoutingModule } from './clothes-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgConfirmModule } from 'ng-confirm-box';



@NgModule({
  declarations: [
    JacketsComponent,
    LongwearComponent,
    ClothesComponent
  ],
  imports: [
    CommonModule,
    ClothesRoutingModule,
    SharedModule,
    NgConfirmModule
  ]
})
export class ClothesModule { }
