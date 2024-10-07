import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { injectStripe } from 'ngx-stripe';

import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/user/user.service';
import { UserForAuth } from 'src/app/types/user';
import { EmbeddedCheckout } from 'src/app/types/embeddedCheckout';
import { HttpError } from 'src/app/types/httpError';
import { CheckoutService } from './checkout.service';
import { Order } from 'src/app/types/order';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  private order$: Order | null = null;
  private embeddedCheckout$: EmbeddedCheckout | null = null;
  public httpError: HttpError = {};

  // Initialize Stripe with your test publishable API key
  private stripe = injectStripe(environment.stripe.publicKey);
  public loading = true;

  constructor(private checkoutService: CheckoutService, private userService: UserService) { }

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...userData };
      }
    });
    if (!this.user) {
      return;
    }
    // Create a Checkout Session
    const embeddedCheckoutSubscription = this.checkoutService.getOrder()
      .pipe(
        switchMap(orderArr => {
          const order = orderArr[0];
          console.log(order);
          this.order$ = { ...order };
          return this.checkoutService.createCheckoutSession(this.order$);
        }),
        switchMap(secret => {
          const { clientSecret } = secret;
          console.log(clientSecret);
          return this.stripe.initEmbeddedCheckout({ clientSecret });
        }),
        catchError((err) => {
          console.log(err);
          this.httpError = err;
          return of(err);
        })
      )
      .subscribe(res => {
        console.log(res);
        this.loading = false;
        if (res == this.httpError) {
          return;
        }
        this.embeddedCheckout$ = Object.create(res);
        // Mount Checkout
        this.embeddedCheckout$?.mount('#checkout');
      });
    this.unsubscriptionArray.push(userSubscription, embeddedCheckoutSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }
}
