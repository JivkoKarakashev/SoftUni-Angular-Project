import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductCreateComponent } from './product-create/product-create.component';
import { CatalogManagerRoutingModule } from './catalog-manager-routing.modules';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    ProductCreateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    CatalogManagerRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    ColorPickerModule
  ]
})
export class CatalogManagerModule { }
