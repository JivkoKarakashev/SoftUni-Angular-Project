import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from './types/item';

const URL = 'http://localhost:3030'

@Injectable({
  providedIn: 'root'
})
export class ShoesService {
  // shoes: Item[] = [];

  constructor(private http: HttpClient) { }

  getShoes() {
    return this.http.get<Item[]>(`${URL}/data/shoes`);
  }
}
