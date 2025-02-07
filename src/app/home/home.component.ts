import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CartItem } from '../types/item';

import config from '../config/carouselSlideConfig';
import { ProcessLastTwoItemsService, lastTwoSlideImgs } from '../shared/utils/process-last-two-items.service';

import { HomeService } from './home.service';
import { ShoppingCartStateManagementService } from '../shared/state-management/shopping-cart-state-management.service';

import { ErrorsService } from '../shared/errors/errors.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public lastTwoSlidesArr: Array<lastTwoSlideImgs[]> = [];
  public slideConfig = config;

  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private homeService: HomeService,
    private processLastTwoItems: ProcessLastTwoItemsService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    this.cartItms = [...this.cartItms, ...this.cartStateMgmnt.getCartItems()];
    this.cartItemsCounter = this.cartItms.length;
    const recentTwoItemsSubscription = this.homeService.getRecentTwoItems()
      .pipe(
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (recentTwoObjs) => {
            this.loading = false;
            this.lastTwoSlidesArr = [...this.lastTwoSlidesArr, ...this.processLastTwoItems.process(recentTwoObjs)];
            // console.log(this.lastTwoSlidesArr);
          },
          error: (err) => {
            this.loading = false;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          }
        }
      );
    this.unsubscriptionArray.push(recentTwoItemsSubscription);

  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  public trackById(_index: number, slide: lastTwoSlideImgs): string {
    // console.log(slide._id);
    return slide._id;
  }
}
