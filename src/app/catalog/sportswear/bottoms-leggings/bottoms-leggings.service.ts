import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';

const URL = 'http://localhost:3030/jsonstore/bottoms_leggings';

@Injectable({
  providedIn: 'root'
})
export class BottomsLeggingsService {
  bottomsLeggings: BottomsLeggings[] = [];

  constructor(private http: HttpClient) { }

  getBottomsLeggings() {
    return this.http.get<BottomsLeggings[]>(URL);
  }
}
