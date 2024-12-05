import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { ChartOptions, purchaseCategoriesChartOptsInit, purchasesSalesChartOptsInit, salesCategoriesChartOptsInit } from 'src/app/types/chartOptions/chartOptions';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CustomError } from 'src/app/shared/errors/custom-error';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { BuildChartsService } from 'src/app/shared/utils/build-charts.service';

// import { DBOrder } from 'src/app/types/order';
// import { Item, TradedItem, } from 'src/app/types/item';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;
  // // private publishedItems: Item[] = [];
  // private publishedItemsCounter: number = 0;
  private orders: DBOrder[] = [];
  // private ordersCounter: number = 0;
  private purchasedItems: TradedItem[] = [];
  // private purchasedItemsCounter: number = 0;
  private soldItems: TradedItem[] = [];
  // private soldItemsCounter: number = 0;

  public loading = false;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  // public chartOpts1: ChartOptions | null = null;
  // public chartOpts2: ChartOptions | null = null;
  // public chartOpts3: ChartOptions | null = null;
  // public chartOpts4: ChartOptions | null = null;
  // public chartOpts5: ChartOptions | null = null;

  public purchasesSalesChartOpts: ChartOptions = purchasesSalesChartOptsInit;
  private purchasesSalesChrtInstance: any;
  public purchasesSalesChrtReadyToShow: boolean = false;

  public purchaseCategoriesChartOpts: ChartOptions = purchaseCategoriesChartOptsInit;
  private purchaseCategoriesChrtInstance: any;
  public purchaseCategoriesChrtReadyToShow: boolean = false;

  public salesCategoriesChartOpts: ChartOptions = salesCategoriesChartOptsInit;
  private salesCategoriesChrtInstance: any;
  public salesCategoriesChrtReadyToShow: boolean = false;

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileDataStateMgmnt: ProfileDataStateManagementService,
    private buildCharts: BuildChartsService
  ) { }

  ngOnInit(): void {
    console.log('Overview Tab Initialized!');

    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.orders = [...this.profileDataStateMgmnt.getOrders()];
    this.profileDataStateMgmnt.getPurchasedItemsByOrder().forEach(trItms => this.purchasedItems.push(...trItms));
    const purchasedItemsQty = this.purchasedItems.length;
    this.soldItems = [...this.profileDataStateMgmnt.getSoldItems()];
    const soldItemsQty = this.soldItems.length;
    if (purchasedItemsQty || soldItemsQty) {
      this.purchasesSalesChartOpts = { ...this.buildCharts.buildPurchasesSalesChart(purchasedItemsQty, soldItemsQty) };
      this.purchasesSalesChrtReadyToShow = true;
    }
    if (purchasedItemsQty) {
      this.purchaseCategoriesChartOpts = { ...this.buildCharts.buildCategoryChart([...this.purchasedItems]) };
      this.purchaseCategoriesChrtReadyToShow = true;
    }
    if (soldItemsQty) {
      this.salesCategoriesChartOpts = { ...this.buildCharts.buildCategoryChart([...this.soldItems]) };
      this.salesCategoriesChrtReadyToShow = true;
    }

  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  getPurchasesSalesChartInstance(e: any) {
    console.log(e);
    this.purchasesSalesChrtInstance = e;
  }
  getPurchaseCategoriesChartInstance(e: any) {
    console.log(e);
    this.purchaseCategoriesChrtInstance = e;
  }
  getSalesCategoriesChartInstance(e: any) {
    console.log(e);
    this.salesCategoriesChrtInstance = e;
  }
}
