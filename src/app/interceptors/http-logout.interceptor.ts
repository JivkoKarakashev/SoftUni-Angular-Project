import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, /*HttpEvent,*/ HttpInterceptor, HTTP_INTERCEPTORS, HttpResponse } from '@angular/common/http';
import { /*Observable,*/ of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserStateManagementService } from '../shared/state-management/user-state-management.service';
export const HttpLogoutInterceptorSkipHeader = 'X-Skip-HttpLogoutInterceptor';

@Injectable()
export class HttpLogoutInterceptor implements HttpInterceptor {

  constructor(private userStateMgmnt: UserStateManagementService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler)/*: Observable<HttpEvent<any>>*/ {
    if (req.headers.has(HttpLogoutInterceptorSkipHeader)) {
      const headers = req.headers.delete(HttpLogoutInterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }
    ////////////////////////////////
    console.log('LogoutInterceptor invoked!');
    if (req.url == 'http://localhost:3030/users/logout') {
      const userSubscription = this.userStateMgmnt.getUserState().subscribe(usr => {
        if (usr) {
          const { accessToken } = usr;
          // console.log(accessToken);
          const authReq = req.clone({
            headers: req.headers.set('X-Authorization', accessToken)
          });
          req = authReq;
        }
      });
      userSubscription.unsubscribe();
    }
    return next.handle(req).pipe(
      map((res/*: HttpEvent<any>*/) => {
        if (res instanceof HttpResponse && res.status == 204) {
          console.log(res.status);
          res = res.clone({ body: null });
          // console.log(res);
        }
        return res;
      }),
      catchError((err) => {
        if (req.url == 'http://localhost:3030/users/logout' && err.status == 403) {
          console.log('Error catched!');
          return of(new HttpResponse({ body: null, status: 204 }));
        }
        console.log('Error:', err);
        throw err;
      })
    )
  }
}

export const httpLogoutInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: HttpLogoutInterceptor
}