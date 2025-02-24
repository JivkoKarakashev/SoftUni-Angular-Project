import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';
import { WaistcoatsComponent } from './waistcoats/waistcoats.component';
import { TuxedosPartywearComponent } from './tuxedos-partywear/tuxedos-partywear.component';
import { TiesComponent } from './ties/ties.component';
import { ProductDetailsComponent } from 'src/app/shared/product-details/product-details.component';
import { WorkwearComponent } from './workwear/workwear.component';
import { SuitsTailoringComponent } from './suits-tailoring/suits-tailoring.component';

const routes: Routes = [
  { path: 'catalog/suits_tailoring', loadChildren: () => import('./suits-tailoring.module').then(m => m.SuitsTailoringModule) },
  { path: 'catalog/suits_tailoring/suits_tailoring', component: SuitsTailoringComponent },
  { path: 'catalog/suits_tailoring/blazers_jackets', component: BlazersJacketsComponent },
  { path: 'catalog/suits_tailoring/blazers_jackets/:id', component: ProductDetailsComponent },
  { path: 'catalog/suits_tailoring/waistcoats', component: WaistcoatsComponent },
  { path: 'catalog/suits_tailoring/waistcoats/:id', component: ProductDetailsComponent },
  { path: 'catalog/suits_tailoring/tuxedos_partywear', component: TuxedosPartywearComponent },
  { path: 'catalog/suits_tailoring/tuxedos_partywear/:id', component: ProductDetailsComponent },
  { path: 'catalog/suits_tailoring/ties', component: TiesComponent },
  { path: 'catalog/suits_tailoring/ties/:id', component: ProductDetailsComponent },
  { path: 'catalog/suits_tailoring/workwear', component: WorkwearComponent },
  { path: 'catalog/suits_tailoring/workwear/:id', component: ProductDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuitsTailoringRoutingModule { }
