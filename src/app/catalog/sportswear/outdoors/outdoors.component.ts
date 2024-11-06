import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { OutdoorsService } from './outdoors.service';
import { Outdoors } from 'src/app/types/outdoors';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';
import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';

@Component({
  selector: 'app-outdoors',
  templateUrl: './outdoors.component.html',
  styleUrls: ['./outdoors.component.css']
})
export class OutdoorsComponent implements OnInit, OnDestroy {
  public listItems: Outdoors[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private outdoorsService: OutdoorsService, private cartService: ShoppingCartService, private checkForInCartAlready: CheckForItemInCartAlreadyService) { }

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      if (userData) {
        this.user = { ...this.user, ...userData };
      }
    });

    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemsCounter = items.length;
      this.cartItms = [...this.cartItms, ...items];
      // console.log(this.cartItms);
    });

    const outdoorsSubscription = this.outdoorsService.getOutdoors().subscribe(outdrsObjs => {
      this.loading = false;
      // console.log(this.cartItms);
      // console.log(this.listItems);
      this.listItems = [...this.listItems, ...this.checkForInCartAlready.check([outdrsObjs], this.cartItms)];
      // console.log(this.listItems);
    });

    this.unsubscriptionArray.push(userSubscription, outdoorsSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 3');
  }

  public addItemtoCart(item: Outdoors): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price, _accountId } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, inCart: true, product: 0, checked: false, _accountId };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], inCart: true };
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }
}
