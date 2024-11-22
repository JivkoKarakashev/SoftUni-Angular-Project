import { Injectable } from '@angular/core';

import { TradedItem } from 'src/app/types/item';
import { DBOrder } from 'src/app/types/order';

export interface FilterButton {
  ref: string,
  status: 'pending' | 'confirmed' | 'rejected' | 'shipped' | 'delivered' | 'split' | 'several',
  state: 'active' | 'inactive'
}

export interface FilteredData {
  'buttons': FilterButton[],
  'dates': string[],
  'orders': DBOrder[],
  'tradedItms': Array<TradedItem[]>
}

export interface FilteredDataSales extends Omit<FilteredData, 'tradedItms'> {
  tradedItms: TradedItem[]
}

@Injectable({
  providedIn: 'root'
})
export class FilterPurchasesDataService {
  private filteredFilterButtons: FilterButton[] = [];
  private filteredOrdersDates: string[] = [];
  private filteredOrders: DBOrder[] = [];
  private filteredTradedItems: Array<TradedItem[]> = [];
  private fData: FilteredData = {
    buttons: [],
    dates: [],
    orders: [],
    tradedItms: []
  };

  filter(
    input: string,
    filterButtons: FilterButton[],
    dbOrdersDates: string[],
    dbOrders: DBOrder[],
    dbTradedItemsArr: Array<TradedItem[]>
  ): FilteredData {
    this.filteredFilterButtons = [...filterButtons];
    this.filteredOrdersDates = [...dbOrdersDates];
    this.filteredOrders = [...dbOrders];
    this.filteredTradedItems = [...dbTradedItemsArr];

    const filterQuery = input.toLowerCase();
    const filteredFilterButtons: FilterButton[] = [];
    const filteredOrdersDates: string[] = [];
    const filteredOrders: DBOrder[] = [];
    const filteredTradedItems: TradedItem[][] = [];
    if (filterQuery) {
      for (let i = 0; i < dbOrders.length; i++) {
        if (dbOrdersDates[i].toLocaleLowerCase().includes(filterQuery)) {
          filteredFilterButtons.push(filterButtons[i]);
          filteredOrdersDates.push(dbOrdersDates[i]);
          filteredOrders.push(dbOrders[i]);
          filteredTradedItems.push(dbTradedItemsArr[i]);
          continue;
        }
        const kvOPairArr = Object.entries(dbOrders[i]);
        let breakIt = false;
        for (const kvPair of kvOPairArr) {
          if (kvPair.some(k => String(k).toLocaleLowerCase().includes(filterQuery))) {
            breakIt = true;
            filteredFilterButtons.push(filterButtons[i]);
            filteredOrdersDates.push(dbOrdersDates[i]);
            filteredOrders.push(dbOrders[i]);
            filteredTradedItems.push(dbTradedItemsArr[i]);
            break;
          }
        }
        if (breakIt) {
          break;
        }
        const currDBTradedItmsArr = Object.values(dbTradedItemsArr[i]);
        for (let j = 0; j < currDBTradedItmsArr.length; j++) {
          let breakIt = false;
          const kvTPairArr = Object.entries(currDBTradedItmsArr[j]);
          for (const kvPair of kvTPairArr) {
            if (kvPair.some(k => String(k).toLocaleLowerCase().includes(filterQuery))) {
              breakIt = true;
              filteredFilterButtons.push(filterButtons[i]);
              filteredOrdersDates.push(dbOrdersDates[i]);
              filteredOrders.push(dbOrders[i]);
              filteredTradedItems.push(dbTradedItemsArr[i]);
              break;
            }
          }
          if (breakIt) {
            break;
          }
        }
      }
      this.filteredFilterButtons = [...filteredFilterButtons];
      this.filteredOrdersDates = [...filteredOrdersDates];
      this.filteredOrders = [...filteredOrders];
      this.filteredTradedItems = [...filteredTradedItems];
    }
    this.fData = {
      buttons: [...this.filteredFilterButtons],
      dates: [...this.filteredOrdersDates],
      orders: [...this.filteredOrders],
      tradedItms: [...this.filteredTradedItems]
    }
    return this.fData;
  }
}
