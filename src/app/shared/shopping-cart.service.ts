import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../types/item';

const URL = 'http://localhost:3030/data/cart'

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private http: HttpClient) { }

  getCartItems() {
    return this.http.get<Item[]>(URL);
  }
}
