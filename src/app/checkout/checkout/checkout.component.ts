import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription, catchError, switchMap } from 'rxjs';
import { injectStripe } from 'ngx-stripe';

import { environment } from 'src/environments/environment';
import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { EmbeddedCheckout } from 'src/app/types/embeddedCheckout';
import { CheckoutService } from './checkout.service';
import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { CustomError } from 'src/app/shared/errors/custom-error';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  private dbOrder: DBOrder | null = null;
  private dbTradedItems: TradedItem[] = [];
  private embeddedCheckout$: EmbeddedCheckout | null = null;

  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  // Initialize Stripe with your test publishable API key
  private stripe = injectStripe(environment.stripe.publicKey);
  public loading = true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private userStateMgmnt: UserStateManagementService,
    private checkoutService: CheckoutService,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    const locationOrigin: string = this.document.location.origin;

    // Create a Checkout Session
    const user = this.userStateMgmnt.getUser();
    try {
      if (user) {
        this.user = { ...user };
      } else {
        const name = 'userError';
        const isUsrErr = true;
        const customError = new CustomError(name, 'Please Login or Register to access your Profile!', isUsrErr);
        throw customError;
      }
    } catch (err) {
      this.loading = false;
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = ([...this.customErrorsArr, { name, message, isUserError }]);
    }

    if (user) {
      try {
        const dbOrder = this.checkoutService.getDBOrder();
        (dbOrder) ? this.dbOrder = { ...dbOrder } : null;
        this.dbTradedItems = [...this.checkoutService.getDBTradedItems()];
        if (!this.dbOrder || !this.dbTradedItems.length) {
          const name = 'dbOrder OR dbTradedItems Error';
          const isUsrErr = false;
          const customError = new CustomError(name, 'Add an item to your cart to proceed with the Checkout!', isUsrErr);
          throw customError;
        }
      } catch (err) {
        this.loading = false;
        const { name, message, isUserError } = err as CustomError;
        this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
        this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
      }
      if (this.dbOrder && this.dbTradedItems) {
        const embeddedCheckoutSub = this.checkoutService.createCheckoutSession({ ...this.dbOrder }, [...this.dbTradedItems], locationOrigin)
          .pipe(
            switchMap(secret => {
              const { clientSecret } = secret;
              // console.log(clientSecret);
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
                // console.log(err);
                // console.log(this.httpErrorsArr);
              }
            }
          );
        this.unsubscriptionArray.push(embeddedCheckoutSub);
      }
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
