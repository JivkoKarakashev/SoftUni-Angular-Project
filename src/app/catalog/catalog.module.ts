import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { CatalogRoutingModule } from './catalog-routing.module';
import { CatalogComponent } from './catalog/catalog.component';
import { ShoesComponent } from './shoes/shoes.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CategoryComponent,
    CatalogComponent,
    ShoesComponent
  ],
  imports: [
    CommonModule, CatalogRoutingModule, FormsModule
  ]
})
export class CatalogModule { }
