import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../types/item';
import { BehaviorSubject, map, filter } from 'rxjs';

const URL = 'http://localhost:3030/data/cart';
// const defualtItem = {
//   _ownerId: '',
//   _id: '',
//   image: '',
//   description: '',
//   color: [],
//   quantity: 0,
//   price:0
// };


@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private items$$ = new BehaviorSubject<Item[]>([]);
  public items$ = this.items$$.asObservable();

  constructor(private http: HttpClient) { }

  getCartItems() {
    // return this.http.get<Item[]>(URL);
    // return this.items$;
  }

  addCartItem(item: Item) {
    this.items$$.next([...this.items$$.value, item]);
    // console.log(this.items$$.value);
    
  }

  removeCartItems(ids: string[]) {
    // console.log(ids);
    this.items$$.pipe(map((items) => items.filter(itm => !ids.includes(itm._id))))
      .subscribe((res) => {
        // console.log(res);
        this.items$$.next([...res]);        
      });      
      // console.log(this.items$$.value);
  }
}
