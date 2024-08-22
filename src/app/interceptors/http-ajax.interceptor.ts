import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { UserForAuth } from '../types/user';
import { UserService } from '../user/user.service';
export const HttpAJAXInterceptorSkipHeader = 'X-Skip-HttpAJAXInterceptor';

@Injectable()
export class HttpAJAXInterceptor implements HttpInterceptor {
  private user$: UserForAuth | null = null;

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has(HttpAJAXInterceptorSkipHeader)) {
      const headers = req.headers.delete(HttpAJAXInterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }
    ////////////////////////////////
    console.log('AJAXInterceptor invoked!');
    let newReq: HttpRequest<any> = req.clone({ ...req });
    if (req.url.startsWith('http://localhost:3030/data/') && req.body) {
      this.userService.user$.subscribe(usr => this.user$ = usr);
      // console.log(this.user$);
      if (this.user$) {
        // console.log('AJAX Iterceptor');
        const { accessToken } = this.user$;
        const addHeaders = { 'Content-Type': 'application/json', 'X-Authorization': accessToken };
        const serializedBody = req.serializeBody();
        newReq = req.clone({ setHeaders: addHeaders, body: serializedBody });
        // console.log(newReq.headers);
      }
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