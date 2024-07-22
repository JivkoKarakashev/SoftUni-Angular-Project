import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SkiSnowboardService } from './ski-snowboard.service';
import { Item } from 'src/app/types/item';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-ski-snowboard',
  templateUrl: './ski-snowboard.component.html',
  styleUrls: ['./ski-snowboard.component.css']
})
export class SkiSnowboardComponent {
  public listItems$: SkiSnowboard[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private ski_snowboardService: SkiSnowboardService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const ski_snowboardSubscription = this.ski_snowboardService.getSkiSnowboard().subscribe(ski_snowboardObjs => {
      this.loading = false;
      let ski_snowboard = Object.entries(ski_snowboardObjs).map(sk_snwbrd => sk_snwbrd[1]);
      ski_snowboard.forEach(ski_snwbrd => {
        ski_snwbrd.buyed = this.cartItms$$.value.some(itm => itm._id == ski_snwbrd._id);
        if (ski_snwbrd.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(ski_snowboard);
      // console.log(ski_snowboard instanceof(Array));
      // console.log(ski_snowboard[0].buyed);
      // this.listItems$ = Object.values(ski_snowboard);
      // console.log(Object.values(ski_snowboard));
      this.listItems$ = ski_snowboard;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(ski_snowboardSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  addItemtoCart(e: Event, item: SkiSnowboard) {
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
