import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CustomError } from './custom-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  private httpErrorsArr$$ = new BehaviorSubject<HttpErrorResponse[]>([]);
  private customErrorsArr$$ = new BehaviorSubject<CustomError[]>([]);

  /////////////////<--- HTTP Errors Response State Management --->//////////////////
  gethttpErrorsArr(): HttpErrorResponse[] {
    return this.httpErrorsArr$$.value;
  }

  sethttpErrorsArrState(httpErrors: HttpErrorResponse[]): void {
    this.httpErrorsArr$$.next([...httpErrors]);
  }

  resethttpErrorsArrState(): void {
    this.httpErrorsArr$$.next([]);
    // console.log(this.httpErrorsArr$$.value);
  }

  /////////////////////<--- Custom Errors State Management --->/////////////////////
  getCustomErrorsArr(): CustomError[] {
    return this.customErrorsArr$$.value;
  }

  setCustomErrorsArrState(customErrsArr: CustomError[]): void {
    // console.log('CUSTOME ERRORS');
    this.customErrorsArr$$.next([...customErrsArr]);
    // console.log(this.customErrorsArr$$.value);
  }

  resetCustomErrorsArrState(): void {
    this.customErrorsArr$$.next([]);
    // console.log(this.customErrorsArr$$.value);
  }
}
