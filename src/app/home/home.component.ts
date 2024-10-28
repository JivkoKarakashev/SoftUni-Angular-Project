import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import config from '../config/carouselSlideConfig';
import { HomeService } from './home.service';
import { ShoppingCartService } from '../shared/shopping-cart/shopping-cart.service';
import { CartItem } from '../types/cartItem';
import { ProcessLastTwoItemsService, lastTwoSlideImgs } from '../shared/utils/process-last-two-items.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public lastTwoSlidesArr: Array<lastTwoSlideImgs[]> = [];
  private cartItms: CartItem[] = [];
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public loading = true;

  public slideConfig = config;

  constructor(private homeService: HomeService, private cartService: ShoppingCartService, private processLastTwoItems: ProcessLastTwoItemsService) { }

  ngOnInit(): void {
    const recentTwoItemsSubscription = this.homeService.getRecentTwoItems().subscribe(recentTwoObjs => {
      this.loading = false;
      this.lastTwoSlidesArr = [...this.lastTwoSlidesArr, ...this.processLastTwoItems.process(recentTwoObjs)];
      // console.log(this.lastTwoSlidesArr);
    });

    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms = ([...this.cartItms, ...items]);
    });
    this.unsubscriptionArray.push(recentTwoItemsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 2');
  }

  public trackById(index: number, slide: lastTwoSlideImgs): string {
    // console.log(slide._id);
    return slide._id;
  }
}
