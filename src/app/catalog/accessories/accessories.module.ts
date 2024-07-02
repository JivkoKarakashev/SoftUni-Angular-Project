import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessoriesRoutingModule } from './accessories-routing.module';
import { CapsHatsComponent } from './caps-hats/caps-hats.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    CapsHatsComponent
  ],
  imports: [
    CommonModule, AccessoriesRoutingModule, SharedModule
  ]
})
export class AccessoriesModule { }
