import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { UserService } from '../user/user.service';
export const HttpAJAXInterceptorSkipHeader = 'X-Skip-HttpAJAXInterceptor';

@Injectable()
export class HttpAJAXInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has(HttpAJAXInterceptorSkipHeader)) {
      const headers = req.headers.delete(HttpAJAXInterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }
    ////////////////////////////////
    console.log('AJAXInterceptor invoked!');
    let newReq: HttpRequest<any> = req.clone({ ...req });
    // console.log(req.body);
    if (req.url.startsWith('http://localhost:3030/data/') && req.body) {
      const userSubscription = this.userService.user$.subscribe(usr => {
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
    return next.handle(newReq).pipe(catchError((err) => {
      console.log(err);
      throw err;
    }));
  }
}

export const httpAJAXInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: HttpAJAXInterceptor
}