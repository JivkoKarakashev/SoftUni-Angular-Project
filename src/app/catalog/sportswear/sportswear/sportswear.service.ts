import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { Gym } from 'src/app/types/gym';
import { Outdoors } from 'src/app/types/outdoors';
import { Running } from 'src/app/types/running';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { Sweater } from 'src/app/types/sweater';
import { SwimSurf } from 'src/app/types/swimSurf';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const GYM_URL = 'http://localhost:3030/data/gym';
const RUNNING_URL = 'http://localhost:3030/data/running';
const SKI_SNOWBOARD_URL = 'http://localhost:3030/data/ski_snowboard';
const SWIM_SURF_URL = 'http://localhost:3030/data/swim_surf';
const OUTDOORS_URL = 'http://localhost:3030/data/outdoors';
const BOTTOMS_LEGGINGS_URL = 'http://localhost:3030/data/bottoms_leggings';
const SWEATERS_URL = 'http://localhost:3030/data/sweaters';

@Injectable({
  providedIn: 'root'
})
export class SportswearService {
  gym: Gym[] = [];
  running: Running[] = [];
  skiSnowboard: SkiSnowboard[] = [];
  swimSurf: SwimSurf[] = [];
  outdoors: Outdoors[] = [];
  bottomsLeggings: BottomsLeggings[] = [];
  sweaters: Sweater[] = [];
  sportswear: (Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater)[] = [];

  constructor(private http: HttpClient) { }

  getSportswear() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Gym[]>(GYM_URL, { headers }),
      this.http.get<Running[]>(RUNNING_URL, { headers }),
      this.http.get<SkiSnowboard[]>(SKI_SNOWBOARD_URL, { headers }),
      this.http.get<SwimSurf[]>(SWIM_SURF_URL, { headers }),
      this.http.get<Outdoors[]>(OUTDOORS_URL, { headers }),
      this.http.get<BottomsLeggings[]>(BOTTOMS_LEGGINGS_URL, { headers }),
      this.http.get<Sweater[]>(SWEATERS_URL, { headers })
    ]);
  }
}
