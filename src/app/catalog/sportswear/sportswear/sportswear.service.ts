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
import { environment } from 'src/environments/environment.development';

const BASE_URL = `${environment.apiDBUrl}/data`;
const GYM_URL = `${BASE_URL}/gym`;
const RUNNING_URL = `${BASE_URL}/running`;
const SKI_SNOWBOARD_URL = `${BASE_URL}/ski_snowboard`;
const SWIM_SURF_URL = `${BASE_URL}/swim_surf`;
const OUTDOORS_URL = `${BASE_URL}/outdoors`;
const BOTTOMS_LEGGINGS_URL = `${BASE_URL}/bottoms_leggings`;
const SWEATERS_URL = `${BASE_URL}/sweaters`;

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
