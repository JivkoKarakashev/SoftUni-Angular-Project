import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CartItem } from 'src/app/types/cartItem';
import { environment } from 'src/environments/environment.development';

const URL = `${environment.apiDBUrl}/data/accounts`

interface CartItemsByOwnerId {
  [_ownerId: string]: CartItem[]
}

@Injectable({
  providedIn: 'root'
})
export class BuildSalesRequestsArrayService {

  constructor(private http: HttpClient) { }

  build(purchasedItems: CartItem[], headers: HttpHeaders): Array<Observable<CartItem>> {
    // console.log(purchasedItems);
    const cartItemsByOwnerId: CartItemsByOwnerId = {};
    const reqArr: Array<Observable<CartItem>> = [];
    purchasedItems.forEach(itm => {
      const { _accountId } = itm;
      // console.log(itm);
      if (_accountId in cartItemsByOwnerId === false) {
        cartItemsByOwnerId[_accountId] = [];
      }
      cartItemsByOwnerId[_accountId].push(itm);
    });

    Object.entries(cartItemsByOwnerId).forEach(([accId, itmsArr]) => {
      const body = JSON.stringify({ sales: [...itmsArr] });
      reqArr.push(this.http.put<CartItem>(`${URL}/${accId}`, body, { headers }));
    });
    return reqArr;
  }
}
