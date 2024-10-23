import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subscription, catchError, iif, of, switchMap } from 'rxjs';

import { ConfirmOrderService } from './confirm-order.service';
import { ShoppingCartService } from '../../shared/shopping-cart/shopping-cart.service';
import { DBOrder } from 'src/app/types/order';
import { HttpError } from 'src/app/types/httpError';

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
  public dbOrderDate: string | null = null;
  public httpError: HttpError = {};

  constructor(private activeRoute: ActivatedRoute, private confirmOrderService: ConfirmOrderService, private cartService: ShoppingCartService) { }

  ngOnInit(): void {
    const orderSubscription = this.confirmOrderService.getDBOrderState().subscribe(dbOrder => {
      this.dbOrder = { ...dbOrder };
    });
    this.unsubscriptionArray.push(orderSubscription);
    const queryParamsSubscription = this.activeRoute.queryParams.subscribe(params => {
      this.session_id = params['session_id'] || '';
      // console.log(this.session_id);
    });
    this.unsubscriptionArray.push(queryParamsSubscription);
    if (this.session_id && this.dbOrder) {
      const sessionStatusSubscription = this.confirmOrderService.getSessionStatus(this.session_id)
        .pipe(
          switchMap(sessionStatus => {
            const { status, customer_email } = sessionStatus;
            this.session_status$ = status || '';
            this.customer_email$ = customer_email;
            // console.log(status);
            return iif(() => status === 'complete', this.switchByStatus.complete(), this.switchByStatus.open());
          }),
          switchMap(orderCollSize => {
            if (this.dbOrder) {
              console.log(orderCollSize);
              const paymentState = 'paid';
              const sequenceNumber = orderCollSize;
              this.dbOrder = { ... this.dbOrder, sequenceNumber: orderCollSize };
              return this.confirmOrderService.updateDBOrderById({ ...this.dbOrder, paymentState, sequenceNumber }, this.dbOrder._id);
            } else {
              return EMPTY;
            }
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
          const dbOrder: DBOrder = { ...res };
          this.dbOrderDate = new Date(dbOrder._createdOn).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          console.log(this.dbOrderDate);
          this.confirmOrderService.setDBOrderState(dbOrder);
          this.cartService.emptyCart();
          this.confirmOrderService.removeDBOrderStateFromLStor();
        });
      this.unsubscriptionArray.push(sessionStatusSubscription);
    }

  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 2');
  }

  private switchByStatus = {
    complete: () => {
      console.log('SESSION STATUS: COMPLETE!!');
      if (this.dbOrder) {
        // return this.confirmOrderService.updateDBOrderById({ ...this.dbOrder, paymentState: 'paid' }, this.dbOrder._id);
        return this.confirmOrderService.getOrederCollectionSize();
      } else {
        return EMPTY;
      }
    },
    open: () => {
      return EMPTY;
    }
  }
}