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
  { path: 'catalog/sportswear/gym/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/running', component: RunningComponent },
  { path: 'catalog/sportswear/running/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/ski_snowboard', component: SkiSnowboardComponent },
  { path: 'catalog/sportswear/ski_snowboard/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/swim_surf', component: SwimSurfComponent },
  { path: 'catalog/sportswear/swim_surf/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/outdoors', component: OutdoorsComponent },
  { path: 'catalog/sportswear/outdoors/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/bottoms_leggings', component: BottomsLeggingsComponent },
  { path: 'catalog/sportswear/bottoms_leggings/:id', component: ProductDetailsComponent },
  { path: 'catalog/sportswear/sweaters', component: SweatersComponent },
  { path: 'catalog/sportswear/sweaters/:id', component: ProductDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SportswearRoutingModule { }
