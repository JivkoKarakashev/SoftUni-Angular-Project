import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BeltsService } from './belts.service';
import { Item } from 'src/app/types/item';
import { Belt } from 'src/app/types/belt';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-belts',
  templateUrl: './belts.component.html',
  styleUrls: ['./belts.component.css']
})
export class BeltsComponent implements OnInit, OnDestroy {
  public listItems$: Belt[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private beltsService: BeltsService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const beltsSubscription = this.beltsService.getBelts().subscribe(beltsObjs => {
      this.loading = false;
      let belts = Object.entries(beltsObjs).map(bts => bts[1]);
      belts.forEach(bts => {
        bts.buyed = this.cartItms$$.value.some(itm => itm._id == bts._id);
        if (bts.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(belts);
      // console.log(belts instanceof(Array));
      // console.log(belts[0].buyed);
      // this.listItems$ = Object.values(belts);
      // console.log(Object.values(belts));
      this.listItems$ = belts;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(beltsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  addItemtoCart(e: Event, item: Belt) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    this.buyedItems++;
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
