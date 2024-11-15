import { Component, OnDestroy, OnInit } from '@angular/core';

import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { OverviewService } from './overview.service';

import { HttpError } from 'src/app/types/httpError';
import { Subscription, catchError, switchMap } from 'rxjs';
import { UserForAuth } from 'src/app/types/user';
import { DBOrder } from 'src/app/types/order';
import { Item, TradedItem, } from 'src/app/types/item';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;
  // private publishedItems: Item[] = [];
  private publishedItemsCounter: number = 0;
  // private orders: DBOrder | null = null;
  private ordersCounter: number = 0;
  // private purchasedItems: TradedItem[] = [];
  private purchasedItemsCounter: number = 0;
  // private soldItems: TradedItem[] = [];
  private soldItemsCounter: number = 0;

  public httpErrorsArr: HttpError[] = [];
  public loading = true;

  constructor(private userStateMgmnt: UserStateManagementService, private overviewService: OverviewService) { }

  ngOnInit(): void {
    console.log('Overview Tab Initialized!');
    const overviewDataSubscription = this.userStateMgmnt.getUserState()
      .pipe(
        switchMap(userData => {
          if (!userData) {
            throw new Error('User is Null!');
          }
          const { _id } = userData;
          this.user = { ... this.user, ...userData };
          return this.overviewService.getOverviewDataByUserId(_id);
        }),
        catchError(err => { throw err; })
      )
      .subscribe({
        next: (overviewData) => {
          this.loading = false;
          const numArr: number[] = [...overviewData];
          const counter: number = numArr.reduce((acc, currV) => acc += currV, 0);
          console.log(counter);
        },
        error: err => {
          this.loading = false;
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          console.log(err);
          console.log(this.httpErrorsArr);
        }
      });
    this.unsubscriptionArray.push(overviewDataSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }
}
