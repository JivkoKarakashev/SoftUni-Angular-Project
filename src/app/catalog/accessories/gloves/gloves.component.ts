import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { GlovesService } from './gloves.service';
import { Glove } from 'src/app/types/glove';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-gloves',
  templateUrl: './gloves.component.html',
  styleUrls: ['./gloves.component.css']
})
export class GlovesComponent implements OnInit, OnDestroy {
  public listItems: Glove[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private glovesService: GlovesService, private cartService: ShoppingCartService) { }

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

    const glovesSubscription = this.glovesService.getGloves().subscribe(glovesObjs => {
      this.loading = false;
      const gloves = Object.entries(glovesObjs).map(glvs => glvs[1]);
      gloves.forEach((glv, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == glv._id)) {
          gloves[idx] = { ...gloves[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...gloves];
    });

    this.unsubscriptionArray.push(userSubscription ,glovesSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Glove): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
