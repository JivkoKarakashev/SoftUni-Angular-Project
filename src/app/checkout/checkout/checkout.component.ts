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
import { ErrorsService } from 'src/app/shared/errors/errors.service';

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

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private checkoutService: CheckoutService,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {

    // Create a Checkout Session
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    if (user) {
      this.dbOrder = { ...this.checkoutService.getDBOrder() };
      this.dbTradedItems = [...this.checkoutService.getDBTradedItems()];
      const embeddedCheckoutSub = this.checkoutService.createCheckoutSession({ ...this.dbOrder }, [...this.dbTradedItems])
        .pipe(
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
              (err instanceof HttpErrorResponse) ? this.httpErrorsArr = [...this.httpErrorsArr, { ...err }] : null;
              (err instanceof Error) ? this.errorsArr = [...this.errorsArr, { ...err, message: err.message }] : null;
              console.log(err);
              console.log(this.httpErrorsArr);
            }
          }
        );
      this.unsubscriptionArray.push(embeddedCheckoutSub);
    } else {
      this.loading = false;
      this.errorsArr.push({ message: 'Please Login or Register to access your Profile!', name: 'User Error' });
      this.errorsService.setErrorsArr([...this.errorsArr]);
    }
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 1');
  }
}
