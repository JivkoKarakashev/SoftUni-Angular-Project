import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CartItem } from 'src/app/types/cartItem';
import { Item } from 'src/app/types/item';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:3030/data';

@Injectable({
  providedIn: 'root'
})
export class BuildUpdateRequestsArrayService {

  constructor(private http: HttpClient) { }

  build(purchasedItems: CartItem[], headers: HttpHeaders): Array<Observable<Item>> {
    const reqArr: Array<Observable<Item>> = [];
    purchasedItems.forEach(itm => {
      const selectedQuantity = itm.selectedQuantity;
      const buyed = false;
      const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = itm;
      const remainQty = quantity - selectedQuantity;
      const updItm: Item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity: remainQty, price, buyed };
      const bldUrl = `${BASE_URL}/${subCat}/${_id}`;
      const body = JSON.stringify({ ...updItm });
      reqArr.push(this.http.put<Item>(bldUrl, body, { headers }));
    });
    return reqArr;
  }
}
