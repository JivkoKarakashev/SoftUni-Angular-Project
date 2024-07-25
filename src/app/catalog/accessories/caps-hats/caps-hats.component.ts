import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { CapsHatsService } from './caps-hats.service';
import { Item } from 'src/app/types/item';
import { CapHat } from 'src/app/types/capHat';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-caps-hats',
  templateUrl: './caps-hats.component.html',
  styleUrls: ['./caps-hats.component.css']
})
export class CapsHatsComponent implements OnInit, OnDestroy {
  public listItems$: CapHat[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private caps_hatsService: CapsHatsService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    const caps_hatsSubscription = this.caps_hatsService.getCapsHats().subscribe(caps_hatsObjs => {
      this.loading = false;
      let caps_hats = Object.entries(caps_hatsObjs).map(cps_hts => cps_hts[1]);
      caps_hats.forEach(cps_hts => {
        cps_hts.buyed = this.cartItms$$.value.some(itm => itm._id == cps_hts._id);
      });
      // console.log(caps_hats);
      // console.log(caps_hats instanceof(Array));
      // console.log(caps_hats[0].buyed);
      // this.listItems$ = Object.values(caps_hats);
      // console.log(Object.values(caps_hats));
      this.listItems$ = caps_hats;
    });

    this.unsubscriptionArray.push(caps_hatsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: CapHat) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
