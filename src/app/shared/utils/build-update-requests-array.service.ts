import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CartItem, Item } from 'src/app/types/item';
import { environment } from 'src/environments/environment.development';

const BASE_URL = `${environment.apiDBUrl}/data`;

@Injectable({
  providedIn: 'root'
})
export class BuildUpdateRequestsArrayService {

  constructor(private http: HttpClient) { }

  build(purchasedItems: CartItem[], headers: HttpHeaders): Array<Observable<Item>> {
    const reqArr: Array<Observable<Item>> = [];
    purchasedItems.forEach(itm => {
      const selectedQuantity = itm.selectedQuantity;
      // const inCart = false;
      const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = itm;
      const remainQty = quantity - selectedQuantity;
      const updItm: Item = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity: remainQty, price };
      const bldUrl = `${BASE_URL}/${subCat}/${_id}`;
      const body = JSON.stringify({ ...updItm });
      reqArr.push(this.http.put<Item>(bldUrl, body, { headers }));
    });
    return reqArr;
  }
}
