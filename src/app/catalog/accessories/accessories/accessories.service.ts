import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Belt } from 'src/app/types/belt';
import { CapHat } from 'src/app/types/capHat';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const CAPS_HATS_URL = 'http://localhost:3030/data/caps_hats';
const BELTS_URL = 'http://localhost:3030/data/belts';
const GLOVES_URL = 'http://localhost:3030/data/gloves';
const SUNGLASSES_URL = 'http://localhost:3030/data/sunglasses';
const WATCHES_URL = 'http://localhost:3030/data/watches';

@Injectable({
  providedIn: 'root'
})
export class AccessoriesService {
  capsHats: CapHat[] = [];
  belts: Belt[] = [];
  gloves: Glove[] = [];
  sunglasses: Sunglasses[] = [];
  watches: Watch[] = [];
  accessories: (CapHat | Belt | Glove | Sunglasses | Watch)[] = [];

  constructor(private http: HttpClient) { }

  getAccessories() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return forkJoin([
      this.http.get<CapHat[]>(CAPS_HATS_URL, { headers }),
      this.http.get<Belt[]>(BELTS_URL, { headers }),
      this.http.get<Glove[]>(GLOVES_URL, { headers }),
      this.http.get<Sunglasses[]>(SUNGLASSES_URL, { headers }),
      this.http.get<Watch[]>(WATCHES_URL, { headers })
    ]);
  }
}
