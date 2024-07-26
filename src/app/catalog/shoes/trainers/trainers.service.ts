import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Trainers } from 'src/app/types/trainers';

const URL = 'http://localhost:3030/jsonstore/trainers';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {
  longwear: Trainers[] = [];

  constructor(private http: HttpClient) { }

  getTrainers() {    
    return this.http.get<Trainers[]>(URL);
  }
}
