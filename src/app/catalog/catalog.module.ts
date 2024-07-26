import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

import { CatalogRoutingModule } from './catalog-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CategoryComponent } from './category/category.component';



@NgModule({
  declarations: [
    CategoryComponent,
  ],
  imports: [
    CommonModule, CatalogRoutingModule/*, FormsModule*/, SharedModule
  ]
})
export class CatalogModule { }
