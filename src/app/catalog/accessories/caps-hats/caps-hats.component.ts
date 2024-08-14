import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { CapsHatsService } from './caps-hats.service';
import { CapHat } from 'src/app/types/capHat';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-caps-hats',
  templateUrl: './caps-hats.component.html',
  styleUrls: ['./caps-hats.component.css']
})
export class CapsHatsComponent implements OnInit, OnDestroy {
  public listItems$: CapHat[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
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
    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // console.log(this.cartItms$$.value);
    });

    const caps_hatsSubscription = this.caps_hatsService.getCapsHats().subscribe(caps_hatsObjs => {
      this.loading = false;
      let caps_hats = Object.entries(caps_hatsObjs).map(cps_hts => cps_hts[1]);
      caps_hats.forEach((cp_ht, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == cp_ht._id)) {
          caps_hats[idx] = { ...caps_hats[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$, ...caps_hats];
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

  public addItemtoCart(item: CapHat) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
