import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Waistcoat } from 'src/app/types/waistcoat';

const URL = 'http://localhost:3030/jsonstore/waistcoats';

@Injectable({
  providedIn: 'root'
})
export class WaistcoatsService {
  waistcoats: Waistcoat[] = [];

  constructor(private http: HttpClient) { }

  getWaistcoats() {
    return this.http.get<Waistcoat[]>(URL);
  }
}
