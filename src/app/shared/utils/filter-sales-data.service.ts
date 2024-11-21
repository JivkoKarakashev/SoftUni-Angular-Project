import { Injectable } from '@angular/core';
import { FilterButton, FilteredDataSales } from './filter-purchases-data.service';
import { TradedItem } from 'src/app/types/item';

@Injectable({
  providedIn: 'root'
})
export class FilterSalesDataService {
  private filteredFilterButtons: FilterButton[] = [];
  private filteredTradedItemsDates: string[] = [];
  private filteredTradedItems: TradedItem[] = [];

  private fData: FilteredDataSales = {
    buttons: [],
    dates: [],
    orders: [],
    tradedItms: []
  };

  filter(
    input: string,
    filterButtons: FilterButton[],
    dbTradedItemsDates: string[],
    dbTradedItems: TradedItem[]
  ): FilteredDataSales {
    this.filteredFilterButtons = [...filterButtons];
    this.filteredTradedItemsDates = [...dbTradedItemsDates];
    this.filteredTradedItems = [...dbTradedItems];

    const filterQuery = input.toLowerCase();
    const filteredFilterButtons: FilterButton[] = [];
    const filteredTradedItemsDates: string[] = [];
    const filteredTradedItems: TradedItem[] = [];
    if (filterQuery) {
      for (let i = 0; i < dbTradedItems.length; i++) {
        const kvPairArr = Object.entries(dbTradedItems[i]);
        if (dbTradedItemsDates[i].toLocaleLowerCase().includes(filterQuery)) {
          filteredFilterButtons.push(filterButtons[i]);
          filteredTradedItemsDates.push(dbTradedItemsDates[i]);
          filteredTradedItems.push(dbTradedItems[i]);
          continue;
        }
        for (const kvPair of kvPairArr) {
          if (kvPair.some(k => String(k).toLocaleLowerCase().includes(filterQuery))) {
            filteredFilterButtons.push(filterButtons[i]);
            filteredTradedItemsDates.push(dbTradedItemsDates[i]);
            filteredTradedItems.push(dbTradedItems[i]);
            break;
          }
        }
      }
      this.filteredFilterButtons = [...filteredFilterButtons];
      this.filteredTradedItemsDates = [...filteredTradedItemsDates];
      this.filteredTradedItems = [...filteredTradedItems];
    }
    this.fData = {
      buttons: [...this.filteredFilterButtons],
      dates: [...this.filteredTradedItemsDates],
      orders: [],
      tradedItms: [...this.filteredTradedItems]
    }
    return this.fData;
  }
}
