import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, switchMap } from 'rxjs';
import { injectStripe } from 'ngx-stripe';

import { environment } from 'src/environments/environment';
import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { EmbeddedCheckout } from 'src/app/types/embeddedCheckout';
import { CheckoutService } from './checkout.service';
import { DBOrder, dbOrderInitialState } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  private dbOrder: DBOrder = dbOrderInitialState;
  private dbTradedItems: TradedItem[] = [];
  private embeddedCheckout$: EmbeddedCheckout | null = null;

  public httpErrorsArr: HttpErrorResponse[] = [];
  public errorsArr: Error[] = [];

  // Initialize Stripe with your test publishable API key
  private stripe = injectStripe(environment.stripe.publicKey);
  public loading = true;

  constructor(private userStateMgmnt: UserStateManagementService, private checkoutService: CheckoutService) { }

  ngOnInit(): void {

    // Create a Checkout Session
    const embeddedCheckoutSubscription = this.userStateMgmnt.getUserState()
      .pipe(
        switchMap(userData => {
          if (userData) {
            this.user = { ...userData };
          } else {
            throw new Error('Please Login or Register to complete Order!');
          }
          return this.checkoutService.getDBOrder();
        }),
        switchMap(dbOrder => {
          this.dbOrder = { ...this.dbOrder, ...dbOrder };
          console.log(this.dbOrder);
          return this.checkoutService.getDBTradedItems()
        }),
        switchMap(dbTradedItms => {
          this.dbTradedItems = [...this.dbTradedItems, ...dbTradedItms];
          console.log(this.dbTradedItems);
          return this.checkoutService.createCheckoutSession({ ...this.dbOrder }, [...this.dbTradedItems]);
        }),
        switchMap(secret => {
          const { clientSecret } = secret;
          console.log(clientSecret);
          return this.stripe.initEmbeddedCheckout({ clientSecret });
        }),
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (strpEmbdChkOut) => {
            this.loading = false;
            this.embeddedCheckout$ = Object.create(strpEmbdChkOut);
            // Mount Checkout
            this.embeddedCheckout$?.mount('#checkout');
          },
          error: err => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
    this.unsubscriptionArray.push(embeddedCheckoutSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 1');
  }
}
