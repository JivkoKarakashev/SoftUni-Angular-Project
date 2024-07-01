import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Boot } from 'src/app/types/boot';

const URL = 'http://localhost:3030/jsonstore/boots';

@Injectable({
  providedIn: 'root'
})
export class BootsService {
  boots: Boot[] = [];

  constructor(private http: HttpClient) { }

  getBoots() {    
    return this.http.get<Boot[]>(URL);
  }
}
