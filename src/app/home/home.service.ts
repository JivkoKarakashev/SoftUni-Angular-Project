import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { BlazerJacket } from '../types/blazerJacket';
import { Waistcoat } from '../types/waistcoat';
import { TuxedoPartywear } from '../types/tuxedoPartywear';
import { Tie } from '../types/tie';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';

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
const RECENT_TWO_GYM_URL = 'http://localhost:3030/data/gym?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_RUNNING_URL = 'http://localhost:3030/data/running?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SKI_SNOWBOARD_URL = 'http://localhost:3030/data/ski_snowboard?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SWIM_SURF_URL = 'http://localhost:3030/data/swim_surf?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_OUTDOORS_URL = 'http://localhost:3030/data/outdoors?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_BOTTOMS_LEGGINGS_URL = 'http://localhost:3030/data/bottoms_leggings?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_SWEATERS_URL = 'http://localhost:3030/data/sweaters?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_BLAZERS_JACKETS_URL = 'http://localhost:3030/data/blazers_jackets?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_WAISTCOATS_URL = 'http://localhost:3030/data/waistcoats?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_TUXEDOS_PARTYWEAR = 'http://localhost:3030/data/tuxedos_partywear?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const RECENT_TWO_TIES = 'http://localhost:3030/data/ties?sortBy=_createdOn%20desc&offset=0&pageSize=2';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getRecentTwoItems() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Jacket[]>(RECENT_TWO_JACKETS_URL, { headers }),
      this.http.get<Longwear[]>(RECENT_TWO_LONGWEAR_URL, { headers }),
      this.http.get<Trainers[]>(RECENT_TWO_TRAINERS_URL, { headers }),
      this.http.get<Boot[]>(RECENT_TWO_BOOTS_URL, { headers }),
      this.http.get<Slippers[]>(RECENT_TWO_SLIPPERS_URL, { headers }),
      this.http.get<CapHat[]>(RECENT_TWO_CAPS_HATS_URL, { headers }),
      this.http.get<Belt[]>(RECENT_TWO_BELTS_URL, { headers }),
      this.http.get<Glove[]>(RECENT_TWO_GLOVES_URL, { headers }),
      this.http.get<Sunglasses[]>(RECENT_TWO_SUNGLASSES_URL, { headers }),
      this.http.get<Watch[]>(RECENT_TWO_WATCHES_URL, { headers }),
      this.http.get<Gym[]>(RECENT_TWO_GYM_URL, { headers }),
      this.http.get<Running[]>(RECENT_TWO_RUNNING_URL, { headers }),
      this.http.get<SkiSnowboard[]>(RECENT_TWO_SKI_SNOWBOARD_URL, { headers }),
      this.http.get<SwimSurf[]>(RECENT_TWO_SWIM_SURF_URL, { headers }),
      this.http.get<Outdoors[]>(RECENT_TWO_OUTDOORS_URL, { headers }),
      this.http.get<BottomsLeggings[]>(RECENT_TWO_BOTTOMS_LEGGINGS_URL, { headers }),
      this.http.get<Sweater[]>(RECENT_TWO_SWEATERS_URL, { headers }),
      this.http.get<BlazerJacket[]>(RECENT_TWO_BLAZERS_JACKETS_URL, { headers }),
      this.http.get<Waistcoat[]>(RECENT_TWO_WAISTCOATS_URL, { headers }),
      this.http.get<TuxedoPartywear[]>(RECENT_TWO_TUXEDOS_PARTYWEAR, { headers }),
      this.http.get<Tie[]>(RECENT_TWO_TIES, { headers })
    ],);
  }
}
