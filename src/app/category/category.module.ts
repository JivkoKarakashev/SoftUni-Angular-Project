import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './category.component';
import { ClothesRoutingModule } from '../catalog/clothes/clothes-routing.module';
import { ShoesRoutingModule } from '../catalog/shoes/shoes-routing.module';
import { AccessoriesRoutingModule } from '../catalog/accessories/accessories-routing.module';
import { SportswearRoutingModule } from '../catalog/sportswear/sportswear-routing.module';
import { SuitsTailoringRoutingModule } from '../catalog/suits-tailoring/suits-tailoring-routing.module';



@NgModule({
  declarations: [
    CategoryComponent
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    ClothesRoutingModule,
    ShoesRoutingModule,
    AccessoriesRoutingModule,
    SportswearRoutingModule,
    SuitsTailoringRoutingModule
  ],
  exports: [
    CategoryComponent
  ]
})
export class CategoryModule { }
