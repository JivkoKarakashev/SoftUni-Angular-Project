import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { LongwearService } from './longwear.service';
import { Longwear } from 'src/app/types/longwear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-longwear',
  templateUrl: './longwear.component.html',
  styleUrls: ['./longwear.component.css']
})
export class LongwearComponent implements OnInit, OnDestroy {
  public listItems: Longwear[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private longwearService: LongwearService, private cartService: ShoppingCartService) { }

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

    const longwearSubscription = this.longwearService.getLongwear().subscribe(longwearObjs => {
      this.loading = false;
      const longwaer = Object.entries(longwearObjs).map(lngwear => lngwear[1]);
      longwaer.forEach((lngwr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == lngwr._id)) {
          longwaer[idx] = { ...longwaer[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...longwaer];
    });

    this.unsubscriptionArray.push(userSubscription, longwearSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Longwear): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
