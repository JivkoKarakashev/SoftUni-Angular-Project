import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapsHats } from 'src/app/types/capsHats';

const URL = 'http://localhost:3030/jsonstore/caps_hats';

@Injectable({
  providedIn: 'root'
})
export class CapsHatsService {
  capsHats: CapsHats[] = [];

  constructor(private http: HttpClient) { }

  getCapsHats() {    
    return this.http.get<CapsHats[]>(URL);
  }
}
