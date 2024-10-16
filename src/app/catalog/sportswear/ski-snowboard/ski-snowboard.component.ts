import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { SkiSnowboardService } from './ski-snowboard.service';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-ski-snowboard',
  templateUrl: './ski-snowboard.component.html',
  styleUrls: ['./ski-snowboard.component.css']
})
export class SkiSnowboardComponent implements OnInit, OnDestroy {
  public listItems: SkiSnowboard[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private ski_snowboardService: SkiSnowboardService, private cartService: ShoppingCartService) { }

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...userData };
      }
    });

    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // console.log(this.cartItms$$.value);
    });

    const ski_snowboardSubscription = this.ski_snowboardService.getSkiSnowboard().subscribe(ski_snowboardObjs => {
      this.loading = false;
      const ski_snowboard = Object.entries(ski_snowboardObjs).map(sk_snwbrd => sk_snwbrd[1]);
      ski_snowboard.forEach((ski_snwbrd, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == ski_snwbrd._id)) {
          ski_snowboard[idx] = { ...ski_snowboard[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...ski_snowboard];
    });

    this.unsubscriptionArray.push(userSubscription, ski_snowboardSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: SkiSnowboard): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
