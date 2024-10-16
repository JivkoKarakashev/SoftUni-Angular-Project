import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { TuxedosPartywearService } from './tuxedos-partywear.service';
import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-tuxedos-partywear',
  templateUrl: './tuxedos-partywear.component.html',
  styleUrls: ['./tuxedos-partywear.component.css']
})
export class TuxedosPartywearComponent implements OnInit, OnDestroy {
  public listItems: TuxedoPartywear[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private tuxedos_partywearService: TuxedosPartywearService, private cartService: ShoppingCartService) { }

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

    const tuxedos_partywearSubscription = this.tuxedos_partywearService.getTuxedosPartywear().subscribe(txds_ptywrObjs => {
      this.loading = false;
      const tuxedos_partywear = Object.entries(txds_ptywrObjs).map(txd_ptywr => txd_ptywr[1]);
      tuxedos_partywear.forEach((txd_ptywr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == txd_ptywr._id)) {
          tuxedos_partywear[idx] = { ...tuxedos_partywear[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...tuxedos_partywear];
    });

    this.unsubscriptionArray.push(userSubscription, tuxedos_partywearSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: TuxedoPartywear): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
