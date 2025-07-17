import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subscription, catchError, switchMap } from 'rxjs';

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
import { CustomError } from 'src/app/shared/errors/custom-error';


@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = []

  public user: UserForAuth | null = null;
  private session_id = '';
  public session_status$: string | null = null;
  public customer_email$: string | null = null;
  public dbOrder: DBOrder | null = null;
  public tradedItems: TradedItem[] | null = null;
  public dbOrderDate: string | null = null;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

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
    const dbOrder = this.orderStateMgmnt.getDBOrder();
    try {
      if (user && dbOrder) {
        this.user = { ...user };
        this.dbOrder = { ...dbOrder };
      } else {
        if (!user) {
          const name = 'userError';
          const isUsrErr = true;
          const customError = new CustomError(name, 'Please Login or Register to complete Order!', isUsrErr);
          throw customError;
        }
        if (!dbOrder) {
          const name = 'dbOrder Error';
          const isUsrErr = false;
          const customError = new CustomError(name, 'DBOrder is null!', isUsrErr);
          throw customError;
        }
      }
    } catch (err) {
      this.loading = false;
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = ([...this.customErrorsArr, { name, message, isUserError }]);
    }

    if (user && dbOrder) {
      const sessionStatusSubs = this.confirmOrderService.getTradedItemsByOrderId(dbOrder._id)
        .pipe(
          switchMap(tradedItmsArr => {
            // console.log(tradedItmsArr);
            if (!tradedItmsArr.length) {
              this.loading = false;
              return EMPTY;
            }
            const status = this.orderStatusCheck.check([...tradedItmsArr]);
            (this.dbOrder) ? this.dbOrder = { ... this.dbOrder, status } : null;
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
              return EMPTY;
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
              this.dbOrderDate = this.numToDateService.convert(dbOrder._createdOn);
              // console.log(this.dbOrderDate);
              this.cartStateMgmnt.emptyCart();
              this.orderStateMgmnt.resetDBOrderState();
              this.tradedItmsStateMgmnt.resetDBTradedItemsState();
            },
            error: err => {
              this.loading = false;
              if (err instanceof HttpErrorResponse) {
                this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
                this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
              }
              else if (err instanceof CustomError) {
                const { name, message, isUserError } = err as CustomError;
                this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
                this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
              }
              // console.log(err);
              // console.log(this.httpErrorsArr);
            }
          }
        );
      this.unsubscriptionArray.push(sessionStatusSubs);
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