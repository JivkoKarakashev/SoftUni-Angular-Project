import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { SportswearComponent } from './sportswear/sportswear.component';
import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';
import { WaistcoatsComponent } from './waistcoats/waistcoats.component';
import { TuxedosPartywearComponent } from './tuxedos-partywear/tuxedos-partywear.component';
import { TiesComponent } from './ties/ties.component';

const routes: Routes = [
  { path: 'catalog/suits-tailoring', loadChildren: () => import('./suits-tailoring.module').then(m => m.SuitsTailoringModule) },
  // { path: 'catalog/sportswear/sportswear', component: SportswearComponent },
  { path: 'catalog/suits-tailoring/blazers-jackets', component: BlazersJacketsComponent },
  { path: 'catalog/suits-tailoring/waistcoats', component: WaistcoatsComponent },
  { path: 'catalog/suits-tailoring/tuxedos-partywear', component: TuxedosPartywearComponent },
  { path: 'catalog/suits-tailoring/ties', component: TiesComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuitsTailoringRoutingModule { }
