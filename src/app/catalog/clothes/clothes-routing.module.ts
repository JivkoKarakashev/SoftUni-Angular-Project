import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClothesComponent } from './clothes/clothes.component';
import { JacketsComponent } from './jackets/jackets.component';
import { LongwearComponent } from './longwear/longwear.component';
import { ProductDetailsComponent } from 'src/app/shared/product-details/product-details.component';

const routes: Routes = [
  { path: 'catalog/clothes', loadChildren: () => import('./clothes.module').then(m => m.ClothesModule) },
  { path: 'catalog/clothes/clothes', component: ClothesComponent },
  { path: 'catalog/clothes/clothes/:id', component: ProductDetailsComponent },
  { path: 'catalog/clothes/jackets', component: JacketsComponent },
  { path: 'catalog/clothes/jackets/:id', component: ProductDetailsComponent },
  { path: 'catalog/clothes/longwear', component: LongwearComponent },
  { path: 'catalog/clothes/longwear/:id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClothesRoutingModule { }
