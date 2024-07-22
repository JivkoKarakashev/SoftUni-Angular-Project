import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { Jacket } from '../types/jacket';
import { Longwear } from '../types/longwear';

const LAST_TWO_JACKETS_URL = 'http://localhost:3030/data/jackets?sortBy=_createdOn%20desc&offset=0&pageSize=2';
const LAST_TWO_LONGWEAR_URL = 'http://localhost:3030/data/longwear?sortBy=_createdOn%20desc&offset=0&pageSize=2';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  jackets: Jacket[] = [];
  longwear: Longwear[] = [];
  clothes: (Jacket & Longwear)[] = [];

  constructor(private http: HttpClient) { }

  getRecentTwoClothes() {    
    return forkJoin([this.http.get<Jacket[]>(LAST_TWO_JACKETS_URL), this.http.get<Longwear>(LAST_TWO_LONGWEAR_URL)]);
  }
}
