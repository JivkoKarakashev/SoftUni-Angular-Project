import { Component, OnInit } from '@angular/core';

import { ChartOptions, purchaseCategoriesChartOptsInit, purchasesSalesChartOptsInit, salesCategoriesChartOptsInit } from 'src/app/types/chartOptions/chartOptions';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { BuildChartsService } from 'src/app/shared/utils/build-charts.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  public user: UserForAuth | null = null;
  private orders: DBOrder[] = [];
  private purchasedItems: TradedItem[] = [];
  private soldItems: TradedItem[] = [];

  public purchasesSalesChartOpts: ChartOptions = { ...purchasesSalesChartOptsInit };
  public purchasesSalesChrtReadyToShow: boolean = false;

  public purchaseCategoriesChartOpts: ChartOptions = { ...purchaseCategoriesChartOptsInit };
  public purchaseCategoriesChrtReadyToShow: boolean = false;

  public salesCategoriesChartOpts: ChartOptions = { ...salesCategoriesChartOptsInit };
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
      this.purchaseCategoriesChartOpts = { ...this.buildCharts.buildPurchaseCategoryChart([...this.purchasedItems]) };
      this.purchaseCategoriesChrtReadyToShow = true;
    }
    if (soldItemsQty) {
      this.salesCategoriesChartOpts = { ...this.buildCharts.buildSalesCategoryChart([...this.soldItems]) };
      this.salesCategoriesChrtReadyToShow = true;
    }

  }

}
