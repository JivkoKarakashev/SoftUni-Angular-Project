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
import { map } from 'rxjs/operators';
import { Item } from './types/item';
import { ShoppingCartService } from './shared/shopping-cart.service';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  public cartItms$: Item[] = [];

  constructor(private cartService: ShoppingCartService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(map((res: HttpEvent<any>) => {
      if (res instanceof HttpResponse) {
        this.cartService.items$.subscribe(items => this.cartItms$ = items);
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
    }));
  }
}

export const appHttpInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AppHttpInterceptor
}