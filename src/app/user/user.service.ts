import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, catchError, map, tap } from 'rxjs';

import { UserForAuth, UserForLogin, UserForRegister } from '../types/user';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private user$$ = new BehaviorSubject<UserForAuth | null>(null);
  public user$ = this.user$$.asObservable();

  private user: UserForAuth | null = null;
  private userSubscription: Subscription

  public get isLoggedIn(): boolean {
    return !!this.user == true;
  }

  public get isLoggedOut(): boolean {
    return !!this.user == false;
  }

  public set setUser(userData: UserForAuth) {
    const { _id, accessToken, email, username } = userData;
    this.user = { ...this.user, _id, accessToken, email, username };
    this.user$$.next({ ...this.user$$, _id, accessToken, email, username });
  }

  constructor(private http: HttpClient) {
    this.userSubscription = this.user$.subscribe((usr) => {
      this.user = usr;
    });
  }

  login(email: string, password: string) {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, password });
    // console.log(body);    
    return this.http.post<UserForLogin>('http://localhost:3030/users/login', body, { headers })
      .pipe(map((user) => {
        const { _id, accessToken, email, username } = user as unknown as UserForAuth;
        localStorage.setItem('userData', JSON.stringify({ _id, accessToken, email, username }));
        this.user$$.next({ _id, accessToken, email, username } as unknown as UserForAuth);
        // console.log(user);        
        // console.log(this.user$$.value);
      }),
        catchError((err) => {
          // console.log(err);
          throw err;
        })
      );
  }

  register(email: string, username: string, password: string,
  ) {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, username, password });
    // console.log(body);

    return this.http.post<UserForRegister>('http://localhost:3030/users/register', body, { headers })
      .pipe(tap((user) => {
        const { _id, accessToken, email, username } = user as unknown as UserForAuth;
        localStorage.setItem('userData', JSON.stringify({ _id, accessToken, email, username }));
        this.user$$.next({ _id, accessToken, email, username } as unknown as UserForAuth);
        // console.log(user);
        // console.log(this.user$$.value);
      }));
  }

  logout() {
    const headers = new HttpHeaders().set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get('http://localhost:3030/users/logout', { headers })
    .pipe(tap((emptyRes) => {
      console.log(emptyRes);
      if (emptyRes == null) {
        this.user$$.next(emptyRes);
        localStorage.removeItem('userData');        
      }      
    }));
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
