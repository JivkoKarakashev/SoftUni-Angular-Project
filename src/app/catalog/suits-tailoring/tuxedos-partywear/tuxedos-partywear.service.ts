import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';

const URL = 'http://localhost:3030/jsonstore/tuxedos_partywear';

@Injectable({
  providedIn: 'root'
})
export class TuxedosPartywearService {
  tuxedosPartywear: TuxedoPartywear[] = [];

  constructor(private http: HttpClient) { }

  getTuxedosPartywear() {
    return this.http.get<TuxedoPartywear[]>(URL);
  }
}
