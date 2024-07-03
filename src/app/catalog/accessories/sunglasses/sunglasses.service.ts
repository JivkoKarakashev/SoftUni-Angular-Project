import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sunglasses } from 'src/app/types/sunglasses';

const URL = 'http://localhost:3030/jsonstore/sunglasses';

@Injectable({
  providedIn: 'root'
})
export class SunglassesService {
  sunglasses: Sunglasses[] = [];

  constructor(private http: HttpClient) { }

  getSunglasses() {
    return this.http.get<Sunglasses[]>(URL);
  }
}
