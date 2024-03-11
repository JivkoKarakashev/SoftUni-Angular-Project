import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { CatalogRoutingModule } from './catalog-routing.module';
import { CatalogComponent } from './catalog/catalog.component';



@NgModule({
  declarations: [
    CategoryComponent,
    CatalogComponent
  ],
  imports: [
    CommonModule, CatalogRoutingModule
  ]
})
export class CatalogModule { }
