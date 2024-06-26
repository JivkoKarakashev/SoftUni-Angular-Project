import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Longwear } from 'src/app/types/longwear';

const URL = 'http://localhost:3030/jsonstore/longwear'

@Injectable({
  providedIn: 'root'
})
export class LongwearService {
  longwear: Longwear[] = [];

  constructor(private http: HttpClient) { }

  getLongwear() {    
    return this.http.get<Longwear[]>(URL);
  }
}
