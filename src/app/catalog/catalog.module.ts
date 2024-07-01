import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryComponent } from './category/category.component';
import { CatalogRoutingModule } from './catalog-routing.module';
import { ClothesComponent } from './clothes/clothes.component';
import { JacketsComponent } from './jackets/jackets.component';
import { LongwearComponent } from './longwear/longwear.component';
import { ShoesComponent } from './shoes/shoes.component';
import { SharedModule } from '../shared/shared.module';
import { TrainersComponent } from './trainers/trainers.component';
import { BootsComponent } from './boots/boots.component';



@NgModule({
  declarations: [
    CategoryComponent,
    ClothesComponent,
    JacketsComponent,
    LongwearComponent,
    ShoesComponent,
    TrainersComponent,
    BootsComponent,
  ],
  imports: [
    CommonModule, CatalogRoutingModule, FormsModule, SharedModule
  ]
})
export class CatalogModule { }
