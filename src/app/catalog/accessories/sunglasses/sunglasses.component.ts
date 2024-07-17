import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SunglassesService } from './sunglasses.service';
import { Item } from 'src/app/types/item';
import { Sunglasses } from 'src/app/types/sunglasses';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-sunglasses',
  templateUrl: './sunglasses.component.html',
  styleUrls: ['./sunglasses.component.css']
})
export class SunglassesComponent implements OnInit, OnDestroy {
  public listItems$: Sunglasses[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private sunglassesService: SunglassesService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const sunglassesSubscription = this.sunglassesService.getSunglasses().subscribe(sunglassesObjs => {
      this.loading = false;
      let sunglasses = Object.entries(sunglassesObjs).map(sunglses => sunglses[1]);
      sunglasses.forEach(sunglses => {
        sunglses.buyed = this.cartItms$$.value.some(itm => itm._id == sunglses._id);
        if (sunglses.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(sunglasses);
      // console.log(sunglasses instanceof(Array));
      // console.log(sunglasses[0].buyed);
      // this.listItems$ = Object.values(sunglasses);
      // console.log(Object.values(sunglasses));
      this.listItems$ = sunglasses;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(sunglassesSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  addItemtoCart(e: Event, item: Sunglasses) {
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
