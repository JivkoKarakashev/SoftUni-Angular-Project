import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, tap } from 'rxjs';

import { LoggedInOrLoggedOut, UserForAuth, UserForLogin, UserForRegister, UserWithAccountId, loggedInOrLoggedOutInitState } from '../types/user';
import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';
import { DBOrder } from '../types/order';
import { AccountForRegister, DBAccount,/*, Sales*/ IdProp } from '../types/account';
import { environment } from 'src/environments/environment.development';
import { CartItem } from '../types/cartItem';

const USER_BASE_URL = `${environment.apiDBUrl}/users`;
const ORDERS_BASE_URL = `${environment.apiDBUrl}/data/orders`;
const ACCOUNTS_BASE_URL = `${environment.apiDBUrl}/data/accounts`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user$$ = new BehaviorSubject<UserWithAccountId | null>(null);
  public user$ = this.user$$.asObservable();

  private loggedInOrLoggedOut$$ = new BehaviorSubject<LoggedInOrLoggedOut>(loggedInOrLoggedOutInitState);
  public loggedInOrLoggedOut$ = this.loggedInOrLoggedOut$$.asObservable();

  setUser(userData?: UserWithAccountId | null): void {
    // console.log(userData);
    if (userData) {
      const { _id, accessToken, email, username, address, _accountId } = userData;
      this.user$$.next({ ...this.user$$.value, _id, accessToken, email, username, address, _accountId });
      localStorage.setItem('userData', JSON.stringify({ _id, accessToken, email, username, address, _accountId }));
    } else {
      this.user$$.next(null);
      localStorage.removeItem('userData');
    }
    this.loggedInOrLoggedOut$$.next({ ...this.loggedInOrLoggedOut$$.value, isLoggedIn: !!userData, isLoggedOut: !userData });
  }

  constructor(private http: HttpClient) { }

  login(userData: UserForLogin): Observable<UserForAuth> {
    const { email, password } = userData;
    console.log(email, password);
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, password });
    // console.log(body);    
    return this.http.post<UserForAuth>(`${USER_BASE_URL}/login`, body, { headers });
  }

  register(userData: UserForRegister): Observable<UserForAuth> {
    const { email, username, password, address } = userData;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, username, password, address });
    // console.log(body);
    return this.http.post<UserForAuth>(`${USER_BASE_URL}/register`, body, { headers })
    // .pipe(tap((user) => {
    //   const { _id, accessToken, email, username } = user;
    //   this.setUser({ _id, accessToken, email, username, address });
    // }));
  }

  logout() {
    const headers = new HttpHeaders().set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get(`${USER_BASE_URL}/logout`, { headers })
      .pipe(tap((emptyRes) => {
        console.log(emptyRes);
        if (emptyRes == null) {
          this.setUser(emptyRes);
        }
      }));
  }

  getAlldbOrdersByUserId(userId: string): Observable<DBOrder[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<DBOrder[]>(`${ORDERS_BASE_URL}?where=_ownerId%3D%22${userId}%22`, { headers });
  }

  // getAllSalesByUserId(userId: string): Observable<CartItem[]> {
  //   const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
  //   return this.http.get<CartItem[]>(`${SALES_BASE_URL}/${userId}?select=sales`, { headers });
  // }

  // getProfileDataByUserId(userId: string): Observable<[DBOrder[], Sales]> {
  //   const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
  //   return forkJoin([
  //     this.http.get<DBOrder[]>(`${ORDERS_BASE_URL}?where=_ownerId%3D%22${userId}%22`, { headers }),
  //     this.http.get<Sales>(`${SALES_BASE_URL}/${userId}?select=sales`, { headers })
  //   ]);
  // }

  registerAccount(): Observable<DBAccount> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const body = JSON.stringify({ sales: [] } as AccountForRegister);
    return this.http.post<DBAccount>(ACCOUNTS_BASE_URL, body, { headers });
  }

  // deleteAccountById(userId: string): Observable<DBAccount> {
  //   const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
  //   return this.http.delete<DBAccount>(`${ACCOUNTS_BASE_URL}/${userId}`, { headers });
  // }

  getAccountIdById(userId: string): Observable<IdProp[]> {
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get<IdProp[]>(`${ACCOUNTS_BASE_URL}?where=_ownerId%3D%22${userId}%22&select=_id`, { headers });
  }

}
