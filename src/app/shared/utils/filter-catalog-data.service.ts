import { Injectable } from '@angular/core';

import { ListItem } from 'src/app/types/item';

export interface Color {
  hex: string,
  hexInverted: string,
  name: string
}

export interface PriceFltr {
  from: number,
  to: number
}

export const priceFltrInit: PriceFltr = {
  from: 0,
  to: 0
}

export interface CatalogFilters {
  size: Array<string | number>,
  color: Array<Color>,
  brand: Array<string>,
  price: PriceFltr
}

export const filtersInit: CatalogFilters = {
  size: [],
  color: [],
  brand: [],
  price: {
    from: 0,
    to: 0
  }
}

@Injectable({
  providedIn: 'root'
})
export class FilterCatalogDataService {

  public listItems: ListItem[] = [];
  public filters: CatalogFilters = { ...filtersInit };
  public filteredItems: ListItem[] = [];

  private filterBySize() {
    if (this.filters.size.length === 0) {
      this.filteredItems = [...this.listItems];
      return;
    }
    const filteredItems: ListItem[] = [];
    const listItmsSizesArr = this.listItems.map(itm => itm.size);
    this.filters.size.forEach((size) => {
      listItmsSizesArr.forEach((itmSizeArr, i) => (itmSizeArr.includes(size) ? filteredItems.push(this.listItems[i]) : null));
    });
    this.filteredItems = [...Array.from(new Set([...filteredItems]))].sort((a, b) => a._createdOn - b._createdOn);
    // console.log(this.filteredItems);
  }

  private filterByColor() {
    if (this.filters.color.length === 0) {
      return;
    }
    const filteredItems: ListItem[] = [];
    const filteredItmsColorsArr = this.filteredItems.map(itm => itm.color);
    this.filters.color.forEach((color) => {
      filteredItmsColorsArr.forEach((itmColorArr, i) => (itmColorArr.includes(color.name) ? filteredItems.push(this.filteredItems[i]) : null));
    });
    this.filteredItems = [...Array.from(new Set([...filteredItems]))].sort((a, b) => a._createdOn - b._createdOn);
    // console.log(this.filteredItems);
  }

  private filterByBrand() {
    if (this.filters.brand.length === 0) {
      return;
    }
    const filteredItems: ListItem[] = this.filteredItems.filter(itm => this.filters.brand.includes(itm.brand));
    this.filteredItems = [...filteredItems].sort((a, b) => a._createdOn - b._createdOn);
    // console.log(this.filteredItems);
  }

  private filterByPrice() {
    if (!this.filters.price.from && !this.filters.price.to) {
      return;
    }
    const filteredItems: ListItem[] = this.filteredItems.filter(itm => itm.price >= this.filters.price.from && itm.price <= this.filters.price.to);
    this.filteredItems = [...filteredItems].sort((a, b) => a._createdOn - b._createdOn);
    // console.log(this.filteredItems);
  }

  accumulativeFilter(filters: CatalogFilters, listItms: ListItem[]): ListItem[] {
    // console.log(this.filters, this.listItems, this.filteredItems);
    this.filters = { ...filters };
    this.listItems = [...listItms];
    this.filterBySize();
    this.filterByColor();
    this.filterByBrand();
    this.filterByPrice();
    // console.log(this.filters, this.listItems, this.filteredItems);

    const fData = [...this.filteredItems];
    this.resetFData();
    return fData;
  }

  private clearFData = {
    clearSizeFilter: () => this.filters.size = [],
    clearColorFilter: () => this.filters.color = [],
    clearBrandFilter: () => this.filters.brand = [],
    clearListItems: () => this.listItems = [],
    clearFilteredItems: () => this.filteredItems = []
  }

  private resetFData() {
    this.clearFData.clearSizeFilter();
    this.clearFData.clearColorFilter();
    this.clearFData.clearBrandFilter();
    this.clearFData.clearListItems();
    this.clearFData.clearFilteredItems();
  }
}
