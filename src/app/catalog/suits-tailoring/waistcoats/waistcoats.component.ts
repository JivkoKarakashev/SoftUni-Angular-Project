import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { WaistcoatsService } from './waistcoats.service';
import { Waistcoat } from 'src/app/types/waistcoat';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-waistcoats',
  templateUrl: './waistcoats.component.html',
  styleUrls: ['./waistcoats.component.css']
})
export class WaistcoatsComponent implements OnInit, OnDestroy {
  public listItems: Waistcoat[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private waistcoatsService: WaistcoatsService, private cartService: ShoppingCartService) { }

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

    const waistcoatsSubscription = this.waistcoatsService.getWaistcoats().subscribe(wstctsObjs => {
      this.loading = false;
      const waistcoats = Object.entries(wstctsObjs).map(wstct => wstct[1]);
      waistcoats.forEach((wstct, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == wstct._id)) {
          waistcoats[idx] = { ...waistcoats[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...waistcoats];
    });

    this.unsubscriptionArray.push(userSubscription, waistcoatsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Waistcoat): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
