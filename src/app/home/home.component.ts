import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, switchMap } from 'rxjs';

import { CartItem } from '../types/item';

import config from '../config/carouselSlideConfig';
import { ProcessLastTwoItemsService, lastTwoSlideImgs } from '../shared/utils/process-last-two-items.service';

import { HomeService } from './home.service';
import { ShoppingCartStateManagementService } from '../shared/state-management/shopping-cart-state-management.service';
import { HttpError } from '../types/httpError';


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
  public httpErrorsArr: HttpError[] = [];

  constructor(private homeService: HomeService, private processLastTwoItems: ProcessLastTwoItemsService, private cartStateMgmnt: ShoppingCartStateManagementService) { }

  ngOnInit(): void {
    const recentTwoItemsSubscription = this.homeService.getRecentTwoItems()
      .pipe(
        switchMap(recentTwoObjs => {
          this.lastTwoSlidesArr = [...this.lastTwoSlidesArr, ...this.processLastTwoItems.process(recentTwoObjs)];
          // console.log(this.lastTwoSlidesArr);
          return this.cartStateMgmnt.getCartItemsState();
        }),
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (items) => {
            this.loading = false;
            this.cartItemsCounter = items.length;
            this.cartItms = ([...this.cartItms, ...items]);
          },
          error: (err) => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
      this.unsubscriptionArray.push(recentTwoItemsSubscription);
    // const recentTwoItemsSubscription = this.homeService.getRecentTwoItems().subscribe(recentTwoObjs => {
    //   this.loading = false;
    //   this.lastTwoSlidesArr = [...this.lastTwoSlidesArr, ...this.processLastTwoItems.process(recentTwoObjs)];
    //   // console.log(this.lastTwoSlidesArr);
    // });

    // const cartSubscription = this.cartStateMgmnt.getCartItemsState().subscribe(items => {
    //   this.cartItemsCounter = items.length;
    //   this.cartItms = ([...this.cartItms, ...items]);
    // });
    // this.unsubscriptionArray.push(recentTwoItemsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  public trackById(index: number, slide: lastTwoSlideImgs): string {
    // console.log(slide._id);
    return slide._id;
  }
}
