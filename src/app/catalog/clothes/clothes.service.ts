import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';

const JACKETS_URL = 'http://localhost:3030/jsonstore/jackets';
const LONGWEAR_URL = 'http://localhost:3030/jsonstore/longwear';

@Injectable({
  providedIn: 'root'
})
export class ClothesService {
  jackets: Jacket[] = [];
  longwear: Longwear[] = [];
  clothes: Jacket[] & Longwear[] = [];

  constructor(private http: HttpClient) { }

  getClothes() {    
    return forkJoin([this.http.get<Jacket[]>(JACKETS_URL), this.http.get<Longwear[]>(LONGWEAR_URL)]);
  }
}
