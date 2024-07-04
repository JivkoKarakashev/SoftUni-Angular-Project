import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Watch } from 'src/app/types/watch';

const URL = 'http://localhost:3030/jsonstore/watches';

@Injectable({
  providedIn: 'root'
})
export class WatchesService {
  watches: Watch[] = [];

  constructor(private http: HttpClient) { }

  getWatches() {
    return this.http.get<Watch[]>(URL);
  }
}
