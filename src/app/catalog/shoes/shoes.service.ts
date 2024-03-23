import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Shoes } from '../../types/shoes';

const URL = 'http://localhost:3030/jsonstore/shoes'

@Injectable({
  providedIn: 'root'
})
export class ShoesService {
  shoes: Shoes[] = [];

  constructor(private http: HttpClient) { }

  getShoes() {
    return this.http.get<Shoes[]>(URL);  
  }
}
