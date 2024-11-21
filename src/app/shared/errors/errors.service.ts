import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  private httpErrorsArr$$ = new BehaviorSubject<HttpErrorResponse[]>([]);
  private errorsArr$$ = new BehaviorSubject<Error[]>([]);

  gethttpErrorsArr(): HttpErrorResponse[] {
    return this.httpErrorsArr$$.value;
  }

  sethttpErrorsArr(errors: HttpErrorResponse[]): void {
    console.log(errors);
    this.httpErrorsArr$$.next([...errors]);
  }

  getErrorsArr(): Error[] {
    return this.errorsArr$$.value;
  }

  setErrorsArr(errors: Error[]): void {
    this.errorsArr$$.next([...errors]);
  }
}
