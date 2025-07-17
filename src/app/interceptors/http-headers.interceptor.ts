import { Injectable, Provider } from "@angular/core";
import { HTTP_INTERCEPTORS, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError } from "rxjs";

import { environment } from "src/environments/environment.development";

const BASE_URL = environment.apiDBUrl;

@Injectable()
export class HttpHeadersInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // console.log('HttpHeadersInterceptor invoked!');
        // console.log(req.headers);
        let newReq = req.clone({ ...req });
        // console.log(req.body);
        if ((req.url.startsWith(`${BASE_URL}/data`) || req.url.startsWith(`${BASE_URL}/users`)) && req.body) {
            const appJsonHeaders = {
                'Content-Type': 'application/json'
            };
            const serializedBody = req.serializeBody();
            newReq = req.clone({ setHeaders: appJsonHeaders, body: serializedBody });
            // console.log(newReq.headers);

        }
        return next.handle(newReq).pipe(
            catchError((err) => {
                console.log('Error:', err);
                console.log('ERROR RE-THROWN!!!');
                throw err;
            })
        );
    }
}

export const HttpHeadersInterceptorProvider: Provider = {
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: HttpHeadersInterceptor
}