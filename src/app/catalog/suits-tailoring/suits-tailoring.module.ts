import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuitsTailoringRoutingModule } from './suits-tailoring-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';



@NgModule({
  declarations: [
    BlazersJacketsComponent
  ],
  imports: [
    CommonModule, SuitsTailoringRoutingModule, SharedModule
  ]
})
export class SuitsTailoringModule { }
