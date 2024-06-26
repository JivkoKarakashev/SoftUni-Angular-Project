import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Jacket } from 'src/app/types/jacket';

const URL = 'http://localhost:3030/jsonstore/jackets'

@Injectable({
  providedIn: 'root'
})
export class JacketsService {
  jackets: Jacket[] = [];

  constructor(private http: HttpClient) { }

  getJackets() {    
    return this.http.get<Jacket[]>(URL);
  }
}
