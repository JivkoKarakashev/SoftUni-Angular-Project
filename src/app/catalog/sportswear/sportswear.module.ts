import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SportswearRoutingModule } from './sportswear-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GymComponent } from './gym/gym.component';
import { RunningComponent } from './running/running.component';
import { SkiSnowboardComponent } from './ski-snowboard/ski-snowboard.component';
import { SwimSurfComponent } from './swim-surf/swim-surf.component';
import { OutdoorsComponent } from './outdoors/outdoors.component';
import { BottomsLeggingsComponent } from './bottoms-leggings/bottoms-leggings.component';
import { SweatersComponent } from './sweaters/sweaters.component';
import { SportswearComponent } from './sportswear/sportswear.component';



@NgModule({
  declarations: [
    GymComponent,
    RunningComponent,
    SkiSnowboardComponent,
    SwimSurfComponent,
    OutdoorsComponent,
    BottomsLeggingsComponent,
    SweatersComponent,
    SportswearComponent
  ],
  imports: [
    CommonModule, SportswearRoutingModule, SharedModule
  ]
})
export class SportswearModule { }
