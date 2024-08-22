import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Trainers } from 'src/app/types/trainers';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

const URL = 'http://localhost:3030/data/trainers';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {
  longwear: Trainers[] = [];

  constructor(private http: HttpClient) { }

  getTrainers() {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<Trainers[]>(URL, { headers });
  }
}
