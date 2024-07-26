import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Slippers } from 'src/app/types/slippers';

const URL = 'http://localhost:3030/jsonstore/slippers';

@Injectable({
  providedIn: 'root'
})
export class SlippersService {
  boots: Slippers[] = [];

  constructor(private http: HttpClient) { }

  getSlippers() {    
    return this.http.get<Slippers[]>(URL);
  }
}
