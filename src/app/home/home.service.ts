import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { Jacket } from '../types/jacket';
import { Longwear } from '../types/longwear';
import { Trainers } from '../types/trainers';
import { Boot } from '../types/boot';
import { Slippers } from '../types/slippers';
import { CapHat } from '../types/capHat';
import { Belt } from '../types/belt';
import { Glove } from '../types/glove';
import { Sunglasses } from '../types/sunglasses';
import { Watch } from '../types/watch';
import { Gym } from '../types/gym';
import { Running } from '../types/running';
import { SkiSnowboard } from '../types/skiSnowboard';
import { SwimSurf } from '../types/swimSurf';
import { Outdoors } from '../types/outdoors';
import { BottomsLeggings } from '../types/bottomsLeggings';
import { Sweater } from '../types/sweater';

const RECENT_TWO_JACKETS_URL = 'http://localhost:3030/data/jackets?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_LONGWEAR_URL = 'http://localhost:3030/data/longwear?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_TRAINERS_URL = 'http://localhost:3030/data/trainers?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_BOOTS_URL = 'http://localhost:3030/data/boots?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SLIPPERS_URL = 'http://localhost:3030/data/slippers?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_CAPS_HATS_URL = 'http://localhost:3030/data/caps_hats?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_BELTS_URL = 'http://localhost:3030/data/belts?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_GLOVES_URL = 'http://localhost:3030/data/gloves?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SUNGLASSES_URL = 'http://localhost:3030/data/sunglasses?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_WATCHES_URL = 'http://localhost:3030/data/watches?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_GYM_URL = 'http://localhost:3030/jsonstore/gym?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_RUNNING_URL = 'http://localhost:3030/jsonstore/running?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SKI_SNOWBOARD_URL = 'http://localhost:3030/jsonstore/ski_snowboard?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SWIM_SURF_URL = 'http://localhost:3030/jsonstore/swim_surf?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_OUTDOORS_URL = 'http://localhost:3030/jsonstore/outdoors?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_BOTTOMS_LEGGINGS_URL = 'http://localhost:3030/jsonstore/bottoms_leggings?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SWEATERS_URL = 'http://localhost:3030/jsonstore/sweaters?sortBy=_createdOn%20desc&offset=0&pageSize=2';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getRecentTwoItems() {
    return forkJoin([
      this.http.get<Jacket[]>(RECENT_TWO_JACKETS_URL),
      this.http.get<Longwear>(RECENT_TWO_LONGWEAR_URL),
      this.http.get<Trainers[]>(RECENT_TWO_TRAINERS_URL),
      this.http.get<Boot[]>(RECENT_TWO_BOOTS_URL),
      this.http.get<Slippers[]>(RECENT_TWO_SLIPPERS_URL),
      this.http.get<CapHat[]>(RECENT_TWO_CAPS_HATS_URL),
      this.http.get<Belt[]>(RECENT_TWO_BELTS_URL),
      this.http.get<Glove[]>(RECENT_TWO_GLOVES_URL),
      this.http.get<Sunglasses[]>(RECENT_TWO_SUNGLASSES_URL),
      this.http.get<Watch[]>(RECENT_TWO_WATCHES_URL),
      this.http.get<Gym[]>(RECENT_TWO_GYM_URL),
      this.http.get<Running[]>(RECENT_TWO_RUNNING_URL),
      this.http.get<SkiSnowboard[]>(RECENT_TWO_SKI_SNOWBOARD_URL),
      this.http.get<SwimSurf[]>(RECENT_TWO_SWIM_SURF_URL),
      this.http.get<Outdoors[]>(RECENT_TWO_OUTDOORS_URL),
      this.http.get<BottomsLeggings[]>(RECENT_TWO_BOTTOMS_LEGGINGS_URL),
      this.http.get<Sweater[]>(RECENT_TWO_SWEATERS_URL)
    ]);
  }
}
