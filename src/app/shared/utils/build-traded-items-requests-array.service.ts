import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment.development';

import { CartItem, TradedItem } from 'src/app/types/item';
import { DBOrder } from 'src/app/types/order';

const TRADES_URL = `${environment.apiDBUrl}/data/traded_items`;

@Injectable({
  providedIn: 'root'
})
export class BuildTradedItemsRequestsArrayService {

  constructor(private http: HttpClient) { }

  buildPostReqs(tradedItemsArr: TradedItem[], headers: HttpHeaders): Array<Observable<TradedItem>> {
    // console.log(tradedItemsArr);
    const reqArr: Array<Observable<TradedItem>> = [];
    tradedItemsArr.forEach(itm => {
      const body = JSON.stringify({ ...itm });
      reqArr.push(this.http.post<TradedItem>(TRADES_URL, body, { headers }));
    });
    return reqArr;
  }

  buildTradedItemsArr(purchasedItems: CartItem[], status: 'pending', orderId: string): TradedItem[] {
    const tradedItemsArr: TradedItem[] = [];
    purchasedItems.forEach(itm => {
      const { _id, _ownerId } = itm;
      const tradedItm: TradedItem = { ...itm, orderId, status, stockId: _id, sellerId: _ownerId };
      tradedItemsArr.push(tradedItm);
    });
    return tradedItemsArr;
  }

  buildGetReqs(dbOrdersArr: DBOrder[], headers: HttpHeaders): Array<Observable<TradedItem[]>> {
    // console.log(tradedItemsArr);
    const reqArr: Array<Observable<TradedItem[]>> = [];
    dbOrdersArr.forEach(order => {
      const { _id } = order;
      reqArr.push(this.http.get<TradedItem[]>(`${TRADES_URL}?where=orderId%3D%22${_id}%22`, { headers }));
    });
    return reqArr;
  }

  buildPutReqs(tradedItemsArr: TradedItem[], headers: HttpHeaders): Array<Observable<TradedItem>> {
    // console.log(tradedItemsArr);
    const reqArr: Array<Observable<TradedItem>> = [];
    tradedItemsArr.forEach(itm => {
      const id = itm._id;
      const body = JSON.stringify({ ...itm });
      reqArr.push(this.http.put<TradedItem>(`${TRADES_URL}/${id}`, body, { headers }));
    });
    return reqArr;
  }
}
