import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuitsTailoringRoutingModule } from './suits-tailoring-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';
import { WaistcoatsComponent } from './waistcoats/waistcoats.component';
import { TuxedosPartywearComponent } from './tuxedos-partywear/tuxedos-partywear.component';
import { TiesComponent } from './ties/ties.component';



@NgModule({
  declarations: [
    BlazersJacketsComponent,
    WaistcoatsComponent,
    TuxedosPartywearComponent,
    TiesComponent
  ],
  imports: [
    CommonModule, SuitsTailoringRoutingModule, SharedModule
  ]
})
export class SuitsTailoringModule { }
