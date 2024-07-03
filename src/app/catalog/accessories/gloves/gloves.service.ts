import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Glove } from 'src/app/types/glove';

const URL = 'http://localhost:3030/jsonstore/gloves';

@Injectable({
  providedIn: 'root'
})
export class GlovesService {
  gloves: Glove[] = [];

  constructor(private http: HttpClient) { }

  getGloves() {
    return this.http.get<Glove[]>(URL);
  }
}
