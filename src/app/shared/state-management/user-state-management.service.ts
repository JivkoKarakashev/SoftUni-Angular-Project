import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';

@Injectable({
  providedIn: 'root'
})
export class UserStateManagementService {
  private user$$ = new BehaviorSubject<UserForAuth | null>(null);
  public user$ = this.user$$.asObservable();

  getUserState(): Observable<UserForAuth | null> {
    return this.user$
  }

  getUser(): UserForAuth | null {
    return this.user$$.value;
  }

  setUserState(userData?: UserForAuth | null): void {
    // console.log(userData);
    if (userData) {
      const { _id, accessToken, email, username, address } = userData;
      this.user$$.next({ ...this.user$$.value, _id, accessToken, email, username, address });
      localStorage.setItem('userData', JSON.stringify({ _id, accessToken, email, username, address }));
    } else {
      this.user$$.next(null);
      localStorage.removeItem('userData');
    }
  }

}
