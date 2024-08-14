import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SwimSurfService } from './swim-surf.service';
import { SwimSurf } from 'src/app/types/swimSurf';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-swim-surf',
  templateUrl: './swim-surf.component.html',
  styleUrls: ['./swim-surf.component.css']
})
export class SwimSurfComponent implements OnInit, OnDestroy {
  public listItems$: SwimSurf[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private swim_surfService: SwimSurfService, private cartService: ShoppingCartService) { }

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

    const swim_surfSubscription = this.swim_surfService.getSwimSurf().subscribe(swim_surfObjs => {
      this.loading = false;
      let swim_surf = Object.entries(swim_surfObjs).map(swm_srf => swm_srf[1]);
      swim_surf.forEach((swim_srf, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == swim_srf._id)) {
          swim_surf[idx] = { ...swim_surf[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$, ...swim_surf];
    });

    this.unsubscriptionArray.push(swim_surfSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(item: SwimSurf) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
