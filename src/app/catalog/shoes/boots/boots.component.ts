import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { BootsService } from './boots.service';
import { Boot } from 'src/app/types/boot';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';
import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';

@Component({
  selector: 'app-boots',
  templateUrl: './boots.component.html',
  styleUrls: ['./boots.component.css']
})
export class BootsComponent implements OnInit, OnDestroy {
  public listItems: Boot[] = [];
  private cartItms: CartItem[] = [];
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private bootsService: BootsService, private cartService: ShoppingCartService, private checkForInCartAlready: CheckForItemInCartAlreadyService) { }

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

    const bootsSubscription = this.bootsService.getBoots().subscribe(bootsObjs => {
      this.loading = false;
      // console.log(this.cartItms);
      // console.log(this.listItems);
      this.listItems = [...this.listItems, ...this.checkForInCartAlready.check([bootsObjs], this.cartItms)];
      // console.log(this.listItems);
    });

    this.unsubscriptionArray.push(userSubscription, bootsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 3');
  }

  public addItemtoCart(item: Boot): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], buyed: true };
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }
}
