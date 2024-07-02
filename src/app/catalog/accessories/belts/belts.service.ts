import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Belt } from 'src/app/types/belt';

const URL = 'http://localhost:3030/jsonstore/belts';

@Injectable({
  providedIn: 'root'
})
export class BeltsService {
  capsHats: Belt[] = [];

  constructor(private http: HttpClient) { }

  getBelts() {
    return this.http.get<Belt[]>(URL);
  }
}
