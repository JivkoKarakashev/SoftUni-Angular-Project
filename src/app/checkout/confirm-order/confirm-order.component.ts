import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, catchError, switchMap } from 'rxjs';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';
import { HttpError } from 'src/app/types/httpError';

import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { ConfirmOrderService } from './confirm-order.service';
import { ShoppingCartService } from '../../shared/shopping-cart/shopping-cart.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';


@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  public loading = true;
  private session_id = '';
  public session_status$: string | null = null;
  public customer_email$: string | null = null;
  public dbOrder: DBOrder | null = null;
  public tradedItems: TradedItem[] | null = null;
  public dbOrderDate: string | null = null;
  public httpErrorsArr: HttpError[] = [];

  constructor(
    private orderStateMgmnt: OrderStateManagementService,
    private activeRoute: ActivatedRoute,
    private confirmOrderService: ConfirmOrderService,
    private cartService: ShoppingCartService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService
  ) { }

  ngOnInit(): void {

    const sessionStatusSubscription = this.orderStateMgmnt.getDBOrderState()
      .pipe(
        switchMap(dbOrder => {
          this.dbOrder = { ...dbOrder };
          return this.confirmOrderService.getTradedItemsByOrderId(this.dbOrder._id);
        }),
        switchMap(tradedItmsArr => {
          // console.log(tradedItmsArr);
          this.tradedItems = [...tradedItmsArr];
          return this.activeRoute.queryParams;
        }),
        switchMap(params => {
          this.session_id = params['session_id'] || '';
          return this.confirmOrderService.getSessionStatus(this.session_id);
        }),
        switchMap(sessionStatus => {
          const { status, customer_email } = sessionStatus;
          this.session_status$ = status || '';
          this.customer_email$ = customer_email;
          const paymentState = 'paid';
          if (!this.dbOrder) {
            throw new Error('DBOrder is null!');
          }
          const referenceNumber = this.dbOrder._createdOn.toString(16);
          return this.confirmOrderService.updateDBOrderById({ ...this.dbOrder, paymentState, referenceNumber }, this.dbOrder._id);
        }),
        catchError((err) => { throw err; })
      )
      .subscribe(
        {
          next: (dbOrder) => {
            // console.log(dbOrder);
            this.loading = false;
            this.dbOrder = { ...dbOrder };
            this.dbOrderDate = new Date(dbOrder._createdOn).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            // console.log(this.dbOrderDate);

            this.cartStateMgmnt.emptyCart();
            sessionStatusSubscription.unsubscribe();
            this.orderStateMgmnt.resetDBOrderState();
            this.tradedItmsStateMgmnt.resetDBTradedItemsState();
          },
          error: err => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
    this.unsubscriptionArray.push(sessionStatusSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 1');
  }
}