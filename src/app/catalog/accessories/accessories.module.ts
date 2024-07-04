import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessoriesRoutingModule } from './accessories-routing.module';
import { CapsHatsComponent } from './caps-hats/caps-hats.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BeltsComponent } from './belts/belts.component';
import { GlovesComponent } from './gloves/gloves.component';
import { SunglassesComponent } from './sunglasses/sunglasses.component';
import { WatchesComponent } from './watches/watches.component';
import { AccessoriesComponent } from './accessories/accessories.component';



@NgModule({
  declarations: [
    CapsHatsComponent,
    BeltsComponent,
    GlovesComponent,
    SunglassesComponent,
    WatchesComponent,
    AccessoriesComponent
  ],
  imports: [
    CommonModule, AccessoriesRoutingModule, SharedModule
  ]
})
export class AccessoriesModule { }
