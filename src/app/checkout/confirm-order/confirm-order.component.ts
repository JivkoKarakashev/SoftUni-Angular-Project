import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, catchError, switchMap, takeUntil } from 'rxjs';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { OrderStatusCheckService } from 'src/app/shared/utils/order-status-check.service';
import { ConfirmOrderService } from './confirm-order.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';

import { HttpErrorResponse } from '@angular/common/http';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { UserForAuth } from 'src/app/types/user';
import { ErrorsService } from 'src/app/shared/errors/errors.service';


@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = []
  private destroy$$ = new Subject<void>();;

  public user: UserForAuth | null = null;
  private session_id = '';
  public session_status$: string | null = null;
  public customer_email$: string | null = null;
  public dbOrder: DBOrder | null = null;
  public tradedItems: TradedItem[] | null = null;
  public dbOrderDate: string | null = null;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public errorsArr: Error[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private activeRoute: ActivatedRoute,
    private confirmOrderService: ConfirmOrderService,
    private orderStatusCheck: OrderStatusCheckService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService,
    private numToDateService: NumberToDateService,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.dbOrder = { ...this.orderStateMgmnt.getDBOrder() };
    if (user) {
      const sessionStatusSubs = this.confirmOrderService.getTradedItemsByOrderId(this.dbOrder._id)
      .pipe(
          switchMap(tradedItmsArr => {
            // console.log(tradedItmsArr);
            if (!tradedItmsArr.length) {
              this.destroy$$.next();
              this.loading = false;
            }
            const status = this.orderStatusCheck.check([...tradedItmsArr]);
            (this.dbOrder) ? this.dbOrder = { ... this.dbOrder, status } : null;
            this.tradedItems = [...tradedItmsArr];
            return this.activeRoute.queryParams;
          }),
          takeUntil(this.destroy$$),
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
              this.destroy$$.next();
              throw new Error('DBOrder is null!');
            }
            const referenceNumber = this.dbOrder._createdOn.toString(16);
            return this.confirmOrderService.updateDBOrderById({ ...this.dbOrder, paymentState, referenceNumber }, this.dbOrder._id);
          }),
          takeUntil(this.destroy$$),
          catchError((err) => { throw err; })
        )
        .subscribe(
          {
            next: (dbOrder) => {
              // console.log(dbOrder);
              this.loading = false;
              this.dbOrder = { ...dbOrder };
              this.dbOrderDate = this.numToDateService.convert(dbOrder._createdOn);
              // console.log(this.dbOrderDate);

              this.cartStateMgmnt.emptyCart();
              this.orderStateMgmnt.resetDBOrderState();
              this.tradedItmsStateMgmnt.resetDBTradedItemsState();
            },
            error: err => {
              this.loading = false;
              if (err instanceof HttpErrorResponse) {
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
                this.errorsService.sethttpErrorsArr([...this.httpErrorsArr]);
              }
              else if (err instanceof Error) {
                this.errorsArr = [...this.errorsArr, { ...err, message: err.message }];
                this.errorsService.setErrorsArr([...this.errorsArr]);
              }
              console.log(err);
              console.log(this.httpErrorsArr);
            }
          }
        );
      this.unsubscriptionArray.push(sessionStatusSubs);
    } 

  }

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 1');
  }
}