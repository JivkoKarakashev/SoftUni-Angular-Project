import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Belt } from 'src/app/types/belt';
import { CapHat } from 'src/app/types/capHat';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';

const CAPS_HATS_URL = 'http://localhost:3030/jsonstore/caps_hats';
const BELTS_URL = 'http://localhost:3030/jsonstore/belts';
const GLOVES_URL = 'http://localhost:3030/jsonstore/gloves';
const SUNGLASSES_URL = 'http://localhost:3030/jsonstore/sunglasses';
const WATCHES_URL = 'http://localhost:3030/jsonstore/watches';

@Injectable({
  providedIn: 'root'
})
export class AccessoriesService {
  capsHats: CapHat[] = [];
  belts: Belt[] = [];
  gloves: Glove[] = [];
  sunglasses: Sunglasses[] = [];
  watches: Watch[] = [];
  accessories: (CapHat & Belt & Glove & Sunglasses & Watch)[] = [];

  constructor(private http: HttpClient) { }

  getAccessories() {
    return forkJoin([
      this.http.get<CapHat[]>(CAPS_HATS_URL),
      this.http.get<Belt[]>(BELTS_URL),
      this.http.get<Glove[]>(GLOVES_URL),
      this.http.get<Sunglasses[]>(SUNGLASSES_URL),
      this.http.get<Watch[]>(WATCHES_URL)
    ]);
  }
}
