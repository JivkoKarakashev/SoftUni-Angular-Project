import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sweater } from 'src/app/types/sweater';

const URL = 'http://localhost:3030/jsonstore/sweaters';

@Injectable({
  providedIn: 'root'
})
export class SweatersService {
  sweaters: Sweater[] = [];

  constructor(private http: HttpClient) { }

  getSweaters() {
    return this.http.get<Sweater[]>(URL);
  }
}
