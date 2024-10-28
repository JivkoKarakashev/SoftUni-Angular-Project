import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { ShoesService } from './shoes.service';
import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';
import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';

@Component({
  selector: 'app-shoes',
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit, OnDestroy {
  public listItems: (Trainers | Boot | Slippers)[] = [];
  private cartItms: CartItem[] = [];
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private shoesService: ShoesService, private cartService: ShoppingCartService, private checkForInCartAlready: CheckForItemInCartAlreadyService) { }

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...this.user, ...userData };
      }
    });

    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms = [...this.cartItms, ...items];
      // console.log(this.cartItms);
    });

    const shoesSubscription = this.shoesService.getShoes().subscribe(shoesObjs => {
      this.loading = false;
      // console.log(this.cartItms);
      // console.log(this.listItems);
      this.listItems = [...this.listItems, ...this.checkForInCartAlready.check(shoesObjs, this.cartItms)];
      // console.log(this.listItems);
    });

    this.unsubscriptionArray.push(userSubscription, shoesSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 3');
  }

  public addItemtoCart(item: Trainers | Boot | Slippers): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], buyed: true };
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }
}
