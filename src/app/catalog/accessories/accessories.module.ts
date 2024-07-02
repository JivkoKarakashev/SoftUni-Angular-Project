import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessoriesRoutingModule } from './accessories-routing.module';
import { CapsHatsComponent } from './caps-hats/caps-hats.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BeltsComponent } from './belts/belts.component';



@NgModule({
  declarations: [
    CapsHatsComponent,
    BeltsComponent
  ],
  imports: [
    CommonModule, AccessoriesRoutingModule, SharedModule
  ]
})
export class AccessoriesModule { }
