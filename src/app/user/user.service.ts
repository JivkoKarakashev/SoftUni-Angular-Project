import { HttpClient/*, HttpErrorResponse*/, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { UserForAuth, UserForLogin, UserForRegister } from '../types/user';

import { HttpAJAXInterceptorSkipHeader } from '../interceptors/http-ajax.interceptor';
import { HttpLogoutInterceptorSkipHeader } from '../interceptors/http-logout.interceptor';

import { DestroySubsNotifierService } from '../shared/utils/destroy-subs-notifier.service';
import { UserStateManagementService } from '../shared/state-management/user-state-management.service';

const USERS_URL = `${environment.apiDBUrl}/users`;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private destroySubsNotifier: DestroySubsNotifierService,
    private userStateMgmnt: UserStateManagementService
  ) { }

  login(userData: UserForLogin): Observable<UserForAuth> {
    const { email, password } = userData;
    // console.log(email, password);
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, password });
    // console.log(body);    
    return this.http.post<UserForAuth>(`${USERS_URL}/login`, body, { headers });
  }

  register(userData: UserForRegister): Observable<UserForAuth> {
    const { email, username, password, address } = userData;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '').set(HttpAJAXInterceptorSkipHeader, '');
    const body = JSON.stringify({ email, username, password, address });
    // console.log(body);
    return this.http.post<UserForAuth>(`${USERS_URL}/register`, body, { headers });
  }

  logout() {
    // this.destroySubsNotifier.destroy();
    const headers = new HttpHeaders().set(HttpAJAXInterceptorSkipHeader, '');
    return this.http.get(`${USERS_URL}/logout`, { headers })
      .pipe(
        tap(
          (emptyRes) => {
            // console.log(emptyRes);
            if (emptyRes == null) {
              // throw new HttpErrorResponse({statusText: 'Error'});
              this.userStateMgmnt.setUserState(emptyRes);
            }
          }
        )
      );
  }

}
