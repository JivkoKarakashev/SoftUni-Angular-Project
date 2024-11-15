import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment.development';
import { Bottom, Gym, Legging, Outdoors, Running, Ski, Snowboard, Surf, Sweater, Swim } from 'src/app/types/item';

import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

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

  constructor(private http: HttpClient) { }

  getSportswear() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<Gym[]>(GYM_URL, { headers }),
      this.http.get<Running[]>(RUNNING_URL, { headers }),
      this.http.get<(Ski | Snowboard)[]>(SKI_SNOWBOARD_URL, { headers }),
      this.http.get<(Swim | Surf)[]>(SWIM_SURF_URL, { headers }),
      this.http.get<Outdoors[]>(OUTDOORS_URL, { headers }),
      this.http.get<(Bottom | Legging)[]>(BOTTOMS_LEGGINGS_URL, { headers }),
      this.http.get<Sweater[]>(SWEATERS_URL, { headers })
    ]);
  }
}
