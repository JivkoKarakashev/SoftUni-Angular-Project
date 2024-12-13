import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { UserStateManagementService } from '../shared/state-management/user-state-management.service';
export const HttpAJAXInterceptorSkipHeader = 'X-Skip-HttpAJAXInterceptor';

@Injectable()
export class HttpAJAXInterceptor implements HttpInterceptor {

  constructor(private userStateMgmnt: UserStateManagementService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has(HttpAJAXInterceptorSkipHeader)) {
      const headers = req.headers.delete(HttpAJAXInterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }
    ////////////////////////////////
    console.log('AJAXInterceptor invoked!');
    let newReq: HttpRequest<any> = req.clone({ ...req });
    // console.log(req.body);
    if (req.url.startsWith('http://localhost:3030/data/') && (req.body || req.method === 'DELETE')) {
      const userSubscription = this.userStateMgmnt.getUserState().subscribe(usr => {
        if (usr) {
          // console.log(usr);
          const { accessToken } = usr;
          // console.log(accessToken);
          const xAuthorizationHeaders = {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken,
          };
          const xAdminHeaders = {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken,
            'X-Admin': ''
          };
          const serializedBody = req.serializeBody();
          // console.log(newReq.method === 'PUT');
          newReq.method === 'PUT' ? newReq = req.clone({ setHeaders: xAdminHeaders, body: serializedBody }) : newReq = req.clone({ setHeaders: xAuthorizationHeaders, body: serializedBody });
          // console.log(newReq.headers);
        }
      });
      userSubscription.unsubscribe();
    }
    return next.handle(newReq).pipe(
      catchError((err) => {
        if ((newReq.url.startsWith('http://localhost:3030/data/orders?where=_ownerId') && err.status == 404) || (newReq.url.startsWith('http://localhost:3030/data/traded_items?where=sellerId') && err.status == 404)) {
          console.log('ERROR HANDLED!');
          return of(new HttpResponse({ body: [], status: 204 }));
        }
        console.log('Error:', err);
        console.log('ERROR RE-THROWN!!!');
        throw err;
      })
    );
  }
}

export const httpAJAXInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: HttpAJAXInterceptor
}