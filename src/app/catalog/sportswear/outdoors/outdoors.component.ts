import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { OutdoorsService } from './outdoors.service';
import { Outdoors } from 'src/app/types/outdoors';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-outdoors',
  templateUrl: './outdoors.component.html',
  styleUrls: ['./outdoors.component.css']
})
export class OutdoorsComponent implements OnInit, OnDestroy {
  public listItems$: Outdoors[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;
  

  constructor(private userService: UserService, private outdoorsService: OutdoorsService, private cartService: ShoppingCartService) { }

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

    const outdoorsSubscription = this.outdoorsService.getOutdoors().subscribe(outdrsObjs => {
      this.loading = false;
      let outdoors = Object.entries(outdrsObjs).map(outdr => outdr[1]);
      outdoors.forEach((outdr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == outdr._id)) {
          outdoors[idx] = { ...outdoors[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$ ,...outdoors];
    });

    this.unsubscriptionArray.push(outdoorsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(item: Outdoors) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
