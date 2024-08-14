import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';

const TRAINERS_URL = 'http://localhost:3030/jsonstore/trainers';
const BOOTS_URL = 'http://localhost:3030/jsonstore/boots';
const SLIPPERS_URL = 'http://localhost:3030/jsonstore/slippers';

@Injectable({
  providedIn: 'root'
})
export class ShoesService {
  trainers: Trainers[] = [];
  boots: Boot[] = [];
  slippers: Slippers[] = [];
  shoes: (Trainers | Boot | Slippers)[] = [];

  constructor(private http: HttpClient) { }

  getShoes() {
    return forkJoin([this.http.get<Trainers[]>(TRAINERS_URL), this.http.get<Boot[]>(BOOTS_URL), this.http.get<Slippers[]>(SLIPPERS_URL)]);
  }
}
