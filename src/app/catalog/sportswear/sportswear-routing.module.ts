import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SportswearComponent } from './sportswear/sportswear.component';
import { GymComponent } from './gym/gym.component';
import { RunningComponent } from './running/running.component';
import { SkiSnowboardComponent } from './ski-snowboard/ski-snowboard.component';
import { SwimSurfComponent } from './swim-surf/swim-surf.component';
import { OutdoorsComponent } from './outdoors/outdoors.component';
import { BottomsLeggingsComponent } from './bottoms-leggings/bottoms-leggings.component';
import { SweatersComponent } from './sweaters/sweaters.component';
import { ProductDetailsComponent } from 'src/app/shared/product-details/product-details.component';

const routes: Routes = [
  { path: 'catalog/sportswear', loadChildren: () => import('./sportswear.module').then(m => m.SportswearModule) },
  { path: 'catalog/sportswear/sportswear', component: SportswearComponent },
  { path: 'catalog/sportswear/gym', component: GymComponent },
  { path: 'catalog/sportswear/running', component: RunningComponent },
  { path: 'catalog/sportswear/ski-snowboard', component: SkiSnowboardComponent },
  { path: 'catalog/sportswear/swim-surf', component: SwimSurfComponent },
  { path: 'catalog/sportswear/outdoors', component: OutdoorsComponent },
  { path: 'catalog/sportswear/bottoms-leggings', component: BottomsLeggingsComponent },
  { path: 'catalog/sportswear/sweaters', component: SweatersComponent },
  { path: 'catalog/sportswear/details/:id', component: ProductDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SportswearRoutingModule { }
