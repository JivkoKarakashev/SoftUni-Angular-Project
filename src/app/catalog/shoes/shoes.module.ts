import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShoesRoutingModule } from './shoes-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TrainersComponent } from './trainers/trainers.component';
import { BootsComponent } from './boots/boots.component';
import { SlippersComponent } from './slippers/slippers.component';
import { ShoesComponent } from './shoes/shoes.component';
import { NgConfirmModule } from 'ng-confirm-box';



@NgModule({
  declarations: [
    TrainersComponent,
    BootsComponent,
    SlippersComponent,
    ShoesComponent
  ],
  imports: [
    CommonModule,
    ShoesRoutingModule,
    SharedModule,
    NgConfirmModule
  ]
})
export class ShoesModule { }
