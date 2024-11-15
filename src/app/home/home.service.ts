import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Belt, Blazer, Boot, Bottom, Cap, Glove, Gym, Hat, Jacket, Legging, Longwear, Outdoors, Partywear, Running, Ski, Slippers, Snowboard, Sunglasses, Surf, Sweater, Swim, Tie, Trainers, Tuxedo, Waistcoat, Watch } from '../types/item';

import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';

const BASE_URL = `${environment.apiDBUrl}/data`;
const RECENT_TWO_JACKETS_URL = `${BASE_URL}/jackets?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_LONGWEAR_URL = `${BASE_URL}/longwear?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_TRAINERS_URL = `${BASE_URL}/trainers?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_BOOTS_URL = `${BASE_URL}/boots?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_SLIPPERS_URL = `${BASE_URL}/slippers?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_CAPS_HATS_URL = `${BASE_URL}/caps_hats?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_BELTS_URL = `${BASE_URL}/belts?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_GLOVES_URL = `${BASE_URL}/gloves?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_SUNGLASSES_URL = `${BASE_URL}/sunglasses?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_WATCHES_URL = `${BASE_URL}/watches?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_GYM_URL = `${BASE_URL}/gym?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_RUNNING_URL = `${BASE_URL}/running?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_SKI_SNOWBOARD_URL = `${BASE_URL}/ski_snowboard?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_SWIM_SURF_URL = `${BASE_URL}/swim_surf?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_OUTDOORS_URL = `${BASE_URL}/outdoors?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_BOTTOMS_LEGGINGS_URL = `${BASE_URL}/bottoms_leggings?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_SWEATERS_URL = `${BASE_URL}/sweaters?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_BLAZERS_JACKETS_URL = `${BASE_URL}/blazers_jackets?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_WAISTCOATS_URL = `${BASE_URL}/waistcoats?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_TUXEDOS_PARTYWEAR = `${BASE_URL}/tuxedos_partywear?sortBy=_createdOn%20desc&offset=0&pageSize=2`;
const RECENT_TWO_TIES = `${BASE_URL}/ties?sortBy=_createdOn%20desc&offset=0&pageSize=2`;

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
      this.http.get<(Cap | Hat)[]>(RECENT_TWO_CAPS_HATS_URL, { headers }),
      this.http.get<Belt[]>(RECENT_TWO_BELTS_URL, { headers }),
      this.http.get<Glove[]>(RECENT_TWO_GLOVES_URL, { headers }),
      this.http.get<Sunglasses[]>(RECENT_TWO_SUNGLASSES_URL, { headers }),
      this.http.get<Watch[]>(RECENT_TWO_WATCHES_URL, { headers }),
      this.http.get<Gym[]>(RECENT_TWO_GYM_URL, { headers }),
      this.http.get<Running[]>(RECENT_TWO_RUNNING_URL, { headers }),
      this.http.get<(Ski | Snowboard)[]>(RECENT_TWO_SKI_SNOWBOARD_URL, { headers }),
      this.http.get<(Swim | Surf)[]>(RECENT_TWO_SWIM_SURF_URL, { headers }),
      this.http.get<Outdoors[]>(RECENT_TWO_OUTDOORS_URL, { headers }),
      this.http.get<(Bottom | Legging)[]>(RECENT_TWO_BOTTOMS_LEGGINGS_URL, { headers }),
      this.http.get<Sweater[]>(RECENT_TWO_SWEATERS_URL, { headers }),
      this.http.get<(Blazer | Jacket)[]>(RECENT_TWO_BLAZERS_JACKETS_URL, { headers }),
      this.http.get<Waistcoat[]>(RECENT_TWO_WAISTCOATS_URL, { headers }),
      this.http.get<(Tuxedo | Partywear)[]>(RECENT_TWO_TUXEDOS_PARTYWEAR, { headers }),
      this.http.get<Tie[]>(RECENT_TWO_TIES, { headers })
    ]);
  }
}
