import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwimSurf } from 'src/app/types/swimSurf';

const URL = 'http://localhost:3030/jsonstore/swim_surf';

@Injectable({
  providedIn: 'root'
})
export class SwimSurfService {
  swimSurf: SwimSurf[] = [];

  constructor(private http: HttpClient) { }

  getSwimSurf() {
    return this.http.get<SwimSurf[]>(URL);
  }
}
