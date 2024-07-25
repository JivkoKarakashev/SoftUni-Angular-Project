import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tie } from 'src/app/types/tie';

const URL = 'http://localhost:3030/jsonstore/ties';

@Injectable({
  providedIn: 'root'
})
export class TiesService {
  ties: Tie[] = [];

  constructor(private http: HttpClient) { }

  getTies() {
    return this.http.get<Tie[]>(URL);
  }
}
