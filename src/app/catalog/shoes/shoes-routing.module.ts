import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShoesComponent } from './shoes/shoes.component';
import { TrainersComponent } from './trainers/trainers.component';
import { BootsComponent } from './boots/boots.component';
import { SlippersComponent } from './slippers/slippers.component';
import { ProductDetailsComponent } from 'src/app/shared/product-details/product-details.component';

const routes: Routes = [
  { path: 'catalog/shoes', loadChildren: () => import('./shoes.module').then(m => m.ShoesModule) },
  { path: 'catalog/shoes/shoes', component: ShoesComponent },
  { path: 'catalog/shoes/shoes/:id', component: ProductDetailsComponent },
  { path: 'catalog/shoes/trainers', component: TrainersComponent },
  { path: 'catalog/shoes/trainers/:id', component: ProductDetailsComponent },
  { path: 'catalog/shoes/boots', component: BootsComponent },
  { path: 'catalog/shoes/boots/:id', component: ProductDetailsComponent },
  { path: 'catalog/shoes/slippers', component: SlippersComponent },
  { path: 'catalog/shoes/slippers/:id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShoesRoutingModule { }
