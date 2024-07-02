import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapHat } from 'src/app/types/capHat';

const URL = 'http://localhost:3030/jsonstore/caps_hats';

@Injectable({
  providedIn: 'root'
})
export class CapsHatsService {
  capsHats: CapHat[] = [];

  constructor(private http: HttpClient) { }

  getCapsHats() {
    return this.http.get<CapHat[]>(URL);
  }
}
