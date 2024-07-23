import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlazerJacket } from 'src/app/types/blazerJacket';

const URL = 'http://localhost:3030/jsonstore/blazers_jackets';

@Injectable({
  providedIn: 'root'
})
export class BlazersJacketsService {
  blazersJackets: BlazerJacket[] = [];

  constructor(private http: HttpClient) { }

  getBlazersJackets() {
    return this.http.get<BlazerJacket[]>(URL);
  }
}
