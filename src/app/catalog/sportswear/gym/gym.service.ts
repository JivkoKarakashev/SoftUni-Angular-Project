import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gym } from 'src/app/types/gym';

const URL = 'http://localhost:3030/jsonstore/gym';

@Injectable({
  providedIn: 'root'
})
export class GymService {
  gym: Gym[] = [];

  constructor(private http: HttpClient) { }

  getGym() {
    return this.http.get<Gym[]>(URL);
  }
}
