import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CartItem } from './types/cartItem';
import { ShoppingCartService } from './shared/shopping-cart.service';
import { UserService } from './user/user.service';
import { UserForAuth } from './types/user';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  public cartItms$: CartItem[] = [];

  constructor(private userService: UserService, private cartService: ShoppingCartService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url == 'http://localhost:3030/users/logout') {
      let user: UserForAuth | undefined = undefined;
      this.userService.user$.subscribe(usr => user = usr);
      if (user) {
        const { accessToken } = user;
        // console.log(accessToken);
        const authReq = req.clone({
          headers: req.headers.set('X-Authorization', accessToken)
        });
        req = authReq;
      }
    }
    return next.handle(req).pipe(
      /*map((res: HttpEvent<any>) => {
        if (req.url == 'http://localhost:3030/jsonstore/shoes' && res instanceof HttpResponse) {
          this.cartService.getCartItems().subscribe(items => this.cartItms$ = [...this.cartItms$, ...items]);
          const cartItmsIds = this.cartItms$.map((itm) => itm._id);
          // console.log(cartItmsIds);        
          // console.log(Object.values(res.body));
          const newBody: Item[] = Object.values(res.body);
          newBody.forEach((itm) => {
            if (cartItmsIds.includes(itm._id)) {
              itm.buyed = true;
            }
          });
          // console.log(newBody);
          const newRes = res.clone({ body: newBody });
          // console.log(newRes);
          return newRes;
        } else if (req.url == 'http://localhost:3030/jsonstore/jackets' && res instanceof HttpResponse) {
          this.cartService.getCartItems().subscribe(items => this.cartItms$ = [...this.cartItms$, ...items]);
          const cartItmsIds = this.cartItms$.map((itm) => itm._id);
          // console.log(cartItmsIds);        
          // console.log(Object.values(res.body));
          const newBody: Item[] = Object.values(res.body);
          newBody.forEach((itm) => {
            if (cartItmsIds.includes(itm._id)) {
              itm.buyed = true;
            }
          });
          // console.log(newBody);
          const newRes = res.clone({ body: newBody });
          // console.log(newRes);
          return newRes;
        }
        return res;
      }),*/
      catchError((err) => {
        // console.log(err);
        throw err;
      })
    );
  }
}

export const appHttpInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AppHttpInterceptor
}