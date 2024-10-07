import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, tap } from 'rxjs';

import { LoggedInOrLoggedOut, UserForAuth, UserForLogin, UserForRegister, loggedInOrLoggedOutInitState } from '../types/user';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user$$ = new BehaviorSubject<UserForAuth | null>(null);
  public user$ = this.user$$.asObservable();

  private loggedInOrLoggedOut$$ = new BehaviorSubject<LoggedInOrLoggedOut>(loggedInOrLoggedOutInitState);
  public loggedInOrLoggedOut$ = this.loggedInOrLoggedOut$$.asObservable();

  public setUser(userData?: UserForAuth | null): void {
    // console.log(userData);
    if (userData) {
      const { _id, accessToken, email, username } = userData;
      this.user$$.next({ ...this.user$$, _id, accessToken, email, username });
      localStorage.setItem('userData', JSON.stringify({ _id, accessToken, email, username }));
    } else {
      this.user$$.next(null);
      localStorage.removeItem('userData');
    }
    this.loggedInOrLoggedOut$$.next({ ...this.loggedInOrLoggedOut$$, isLoggedIn: !!userData, isLoggedOut: !userData });
  }

  constructor(private http: HttpClient) { }

  login(userData: UserForLogin) {
    const { email, password } = userData;
    console.log(email, password);
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, password });
    // console.log(body);    
    return this.http.post<UserForAuth>('http://localhost:3030/users/login', body, { headers })
      .pipe(map((user) => {
        const { _id, accessToken, email, username } = user;
        this.setUser({ _id, accessToken, email, username });
      }),
        catchError((err) => {
          // console.log(err);
          throw err;
        })
      );
  }

  register(userData: UserForRegister) {
    const { email, username, password } = userData;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, username, password });
    // console.log(body);
    return this.http.post<UserForAuth>('http://localhost:3030/users/register', body, { headers })
      .pipe(tap((user) => {
        const { _id, accessToken, email, username } = user;
        this.setUser({ _id, accessToken, email, username });
      }));
  }

  logout() {
    const headers = new HttpHeaders().set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get('http://localhost:3030/users/logout', { headers })
      .pipe(tap((emptyRes) => {
        console.log(emptyRes);
        if (emptyRes == null) {
          this.setUser(emptyRes);
        }
      }));
  }
}
