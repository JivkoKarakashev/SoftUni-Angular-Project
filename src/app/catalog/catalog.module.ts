import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryComponent } from './category/category.component';
import { CatalogRoutingModule } from './catalog-routing.module';
import { JacketsComponent } from './jackets/jackets.component';
import { LongwearComponent } from './longwear/longwear.component';
import { ShoesComponent } from './shoes/shoes.component';



@NgModule({
  declarations: [
    CategoryComponent,
    JacketsComponent,
    LongwearComponent,
    ShoesComponent,
  ],
  imports: [
    CommonModule, CatalogRoutingModule, FormsModule
  ]
})
export class CatalogModule { }
