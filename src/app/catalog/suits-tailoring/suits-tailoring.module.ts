import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuitsTailoringRoutingModule } from './suits-tailoring-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';
import { WaistcoatsComponent } from './waistcoats/waistcoats.component';
import { TuxedosPartywearComponent } from './tuxedos-partywear/tuxedos-partywear.component';
import { TiesComponent } from './ties/ties.component';
import { WorkwearComponent } from './workwear/workwear.component';
import { SuitsTailoringComponent } from './suits-tailoring/suits-tailoring.component';



@NgModule({
  declarations: [
    BlazersJacketsComponent,
    WaistcoatsComponent,
    TuxedosPartywearComponent,
    TiesComponent,
    WorkwearComponent,
    SuitsTailoringComponent
  ],
  imports: [
    CommonModule, SuitsTailoringRoutingModule, SharedModule
  ]
})
export class SuitsTailoringModule { }
