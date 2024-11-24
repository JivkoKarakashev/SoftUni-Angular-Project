import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CustomError } from './custom-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  private httpErrorsArr$$ = new BehaviorSubject<HttpErrorResponse[]>([]);
  private httpErrorsArr$ = this.httpErrorsArr$$.asObservable();

  private customErrorsArr$$ = new BehaviorSubject<CustomError[]>([]);
  private customErrorsArr$ = this.customErrorsArr$$.asObservable();

  /////////////////////<--- HTTP Errors Response State Management--->/////////////////////
  gethttpErrorsArrState(): Observable<HttpErrorResponse[]> {
    return this.httpErrorsArr$;
  }

  sethttpErrorsArrState(httpErrors: HttpErrorResponse[]): void {
    this.httpErrorsArr$$.next([...httpErrors]);
  }

  resethttpErrorsArrState(): void {
    this.httpErrorsArr$$.next([]);
    console.log(this.httpErrorsArr$$.value);
  }

  /////////////////////<--- Custom Errors State Management--->/////////////////////
  getCustomErrorsArrState(): Observable<CustomError[]> {
    return this.customErrorsArr$;
  }

  setCustomErrorsArrState(customErrsArr: CustomError[]): void {
    console.log('CUSTOME ERRORS');
    this.customErrorsArr$$.next([...customErrsArr]);
    console.log(this.customErrorsArr$$.value);
  }

  resetCustomErrorsArrState(): void {
    this.customErrorsArr$$.next([]);
    console.log(this.customErrorsArr$$.value);
  }
}
