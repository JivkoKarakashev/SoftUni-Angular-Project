import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Outdoors } from 'src/app/types/outdoors';

const URL = 'http://localhost:3030/jsonstore/outdoors';

@Injectable({
  providedIn: 'root'
})
export class OutdoorsService {
  outdoors: Outdoors[] = [];

  constructor(private http: HttpClient) { }

  getOutdoors() {
    return this.http.get<Outdoors[]>(URL);
  }
}
