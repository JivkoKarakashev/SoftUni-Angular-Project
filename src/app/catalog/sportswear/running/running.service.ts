import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Running } from 'src/app/types/running';

const URL = 'http://localhost:3030/jsonstore/running';

@Injectable({
  providedIn: 'root'
})
export class RunningService {
  running: Running[] = [];

  constructor(private http: HttpClient) { }

  getRunning() {
    return this.http.get<Running[]>(URL);
  }
}
