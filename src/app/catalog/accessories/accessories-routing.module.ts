import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapsHatsComponent } from './caps-hats/caps-hats.component';
import { BeltsComponent } from './belts/belts.component';
import { GlovesComponent } from './gloves/gloves.component';

const routes: Routes = [
  { path: 'catalog/accessories', loadChildren: () => import('./accessories.module').then(m => m.AccessoriesModule) },
  { path: 'catalog/accessories/caps-hats', component: CapsHatsComponent },
  { path: 'catalog/accessories/belts', component: BeltsComponent },
  { path: 'catalog/accessories/gloves', component: GlovesComponent },
  // { path: 'catalog/longwear', component: LongwearComponent },
  // { path: 'catalog/shoes', component: ShoesComponent },
  // { path: 'catalog/trainers', component: TrainersComponent },
  // { path: 'catalog/boots', component: BootsComponent },
  // { path: 'catalog/slippers', component: SlippersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessoriesRoutingModule { }
