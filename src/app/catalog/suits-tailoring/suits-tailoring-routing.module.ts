import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { SportswearComponent } from './sportswear/sportswear.component';
import { BlazersJacketsComponent } from './blazers-jackets/blazers-jackets.component';
// import { RunningComponent } from './running/running.component';
// import { SkiSnowboardComponent } from './ski-snowboard/ski-snowboard.component';
// import { SwimSurfComponent } from './swim-surf/swim-surf.component';
// import { OutdoorsComponent } from './outdoors/outdoors.component';
// import { BottomsLeggingsComponent } from './bottoms-leggings/bottoms-leggings.component';
// import { SweatersComponent } from './sweaters/sweaters.component';

const routes: Routes = [
  { path: 'catalog/suits-tailoring', loadChildren: () => import('./suits-tailoring.module').then(m => m.SuitsTailoringModule) },
  // { path: 'catalog/sportswear/sportswear', component: SportswearComponent },
  { path: 'catalog/suits-tailoring/blazers-jackets', component: BlazersJacketsComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuitsTailoringRoutingModule { }
