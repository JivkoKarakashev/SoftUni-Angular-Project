import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SweatersService } from './sweaters.service';
import { Sweater } from 'src/app/types/sweater';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-sweaters',
  templateUrl: './sweaters.component.html',
  styleUrls: ['./sweaters.component.css']
})
export class SweatersComponent implements OnInit, OnDestroy {
  public listItems: Sweater[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;
  

  constructor(private userService: UserService, private sweatersService: SweatersService, private cartService: ShoppingCartService) { }

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

    const sweatersSubscription = this.sweatersService.getSweaters().subscribe(swtrsObjs => {
      this.loading = false;
      const sweaters = Object.entries(swtrsObjs).map(swtr => swtr[1]);
      sweaters.forEach((swtr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == swtr._id)) {
          sweaters[idx] = { ...sweaters[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems , ...sweaters];
    });

    this.unsubscriptionArray.push(userSubscription, sweatersSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Sweater): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
