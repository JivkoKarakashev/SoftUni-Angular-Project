import { Injectable } from '@angular/core';
import { TradedItem } from 'src/app/types/item';

export type OrderStatus = 'pending' | 'confirmed' | 'rejected' | 'shipped' | 'delivered' | 'split' | 'several';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusCheckService {

  private orderStatus: OrderStatus = 'pending';

  check(dbTradedItemsArr: TradedItem[]): OrderStatus {
    if (!this.isItTheSameMerchant(dbTradedItemsArr)) {
      this.orderStatus = 'several';
      return this.orderStatus;
    }

    if (dbTradedItemsArr.every(itm => itm.status === 'pending')) {
      this.orderStatus = 'pending';
    } else if (dbTradedItemsArr.every(itm => itm.status === 'confirmed')) {
      this.orderStatus = 'confirmed';
    } else if (dbTradedItemsArr.every(itm => itm.status === 'rejected')) {
      this.orderStatus = 'rejected';
    } else if (dbTradedItemsArr.every(itm => itm.status === 'shipped')) {
      this.orderStatus = 'shipped';
    } else if (dbTradedItemsArr.every(itm => itm.status === 'delivered')) {
      this.orderStatus = 'delivered';
    } else {
      this.orderStatus = 'split';
    }

    return this.orderStatus;
  }

  private isItTheSameMerchant(dbTradedItemsArr: TradedItem[]): boolean {
    const sellerId: string = dbTradedItemsArr[0].sellerId;
    return dbTradedItemsArr.every(itm => itm.sellerId === sellerId);
  }
}
