import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClothesComponent } from './clothes/clothes.component';
import { JacketsComponent } from './jackets/jackets.component';
import { LongwearComponent } from './longwear/longwear.component';
import { ShoesComponent } from './shoes/shoes.component';
import { TrainersComponent } from './trainers/trainers.component';
import { BootsComponent } from './boots/boots.component';
import { SlippersComponent } from './slippers/slippers.component';

const routes: Routes = [
  { path: 'catalog/clothes', component: ClothesComponent },
  { path: 'catalog/jackets', component: JacketsComponent },
  { path: 'catalog/longwear', component: LongwearComponent },
  { path: 'catalog/shoes', component: ShoesComponent },
  { path: 'catalog/trainers', component: TrainersComponent },
  { path: 'catalog/boots', component: BootsComponent },
  { path: 'catalog/slippers', component: SlippersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
