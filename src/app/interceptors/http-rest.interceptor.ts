import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { UserService } from '../user/user.service';
import { UserForAuth } from '../types/user';

@Injectable()
export class HttpRESTInterceptor implements HttpInterceptor {
  private user$: UserForAuth | undefined = undefined;

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let newReq: HttpRequest<any> = req.clone({ ...req });
    if (req.url.startsWith('http://localhost:3030/data/') && req.body) {
      this.userService.user$.subscribe(usr => this.user$ = usr);
      // console.log(this.user$);
      if (this.user$) {
        // console.log('REST Iterceptor');
        const { accessToken } = this.user$;
        const addHeaders = { 'Content-Type': 'application/json', 'X-Authorization': accessToken };
        const serializedBody = req.serializeBody();
        newReq = req.clone({ setHeaders: addHeaders, body: serializedBody });
        // console.log(newReq.headers);
      }
    }
    return next.handle(newReq).pipe(catchError((err) => {
      // console.log(err);
      throw err;
    }));
  }
}

export const httpRESTInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: HttpRESTInterceptor
}