import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';

const URL = 'http://localhost:3030/jsonstore/ski_snowboard';

@Injectable({
  providedIn: 'root'
})
export class SkiSnowboardService {
  skiSnowboard: SkiSnowboard[] = [];

  constructor(private http: HttpClient) { }

  getSkiSnowboard() {
    return this.http.get<SkiSnowboard[]>(URL);
  }
}
