import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BottomsLeggingsService } from './bottoms-leggings.service';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-bottoms-leggings',
  templateUrl: './bottoms-leggings.component.html',
  styleUrls: ['./bottoms-leggings.component.css']
})
export class BottomsLeggingsComponent implements OnInit, OnDestroy {
  public listItems: BottomsLeggings[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private bottoms_leggingsService: BottomsLeggingsService, private cartService: ShoppingCartService) { }

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

    const bottoms_leggingsSubscription = this.bottoms_leggingsService.getBottomsLeggings().subscribe(btms_lgingsObjs => {
      this.loading = false;
      const bottoms_leggings = Object.entries(btms_lgingsObjs).map(btm_leg => btm_leg[1]);
      bottoms_leggings.forEach((btm_leg, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == btm_leg._id)) {
          bottoms_leggings[idx] = { ...bottoms_leggings[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...bottoms_leggings];
    });

    this.unsubscriptionArray.push(userSubscription, bottoms_leggingsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: BottomsLeggings): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
