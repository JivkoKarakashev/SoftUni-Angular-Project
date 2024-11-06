import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Trainers } from 'src/app/types/trainers';
import { HttpAJAXInterceptorSkipHeader } from 'src/app/interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/trainers`;

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
