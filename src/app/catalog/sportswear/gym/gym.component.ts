import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { GymService } from './gym.service';
import { Gym } from 'src/app/types/gym';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-gym',
  templateUrl: './gym.component.html',
  styleUrls: ['./gym.component.css']
})
export class GymComponent implements OnInit, OnDestroy {
  public listItems: Gym[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;
  

  constructor(private userService: UserService, private gymService: GymService, private cartService: ShoppingCartService) { }

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

    const gymSubscription = this.gymService.getGym().subscribe(gymObjs => {
      this.loading = false;
      const gym = Object.entries(gymObjs).map(gym => gym[1]);
      gym.forEach((gm, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == gm._id)) {
          gym[idx] = { ...gym[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...gym];
    });

    this.unsubscriptionArray.push(userSubscription, gymSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Gym): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
