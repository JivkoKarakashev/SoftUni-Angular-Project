import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BlazersJacketsService } from './blazers-jackets.service';
import { BlazerJacket } from 'src/app/types/blazerJacket';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-blazers-jackets',
  templateUrl: './blazers-jackets.component.html',
  styleUrls: ['./blazers-jackets.component.css']
})
export class BlazersJacketsComponent implements OnInit, OnDestroy {
  public listItems$: BlazerJacket[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private blazers_jacketsService: BlazersJacketsService, private cartService: ShoppingCartService) { }

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

    const blazers_jacketsSubscription = this.blazers_jacketsService.getBlazersJackets().subscribe(blzrs_jcktsObjs => {
      this.loading = false;
      let blazers_jackets = Object.entries(blzrs_jcktsObjs).map(blzr_jckt => blzr_jckt[1]);
      blazers_jackets.forEach((blzr_jckt, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == blzr_jckt._id)) {
          blazers_jackets[idx] = { ...blazers_jackets[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$, ...blazers_jackets];
    });

    this.unsubscriptionArray.push(blazers_jacketsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(item: BlazerJacket) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
