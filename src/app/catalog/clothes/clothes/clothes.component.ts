import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { ClothesService } from './clothes.service';
import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-clothes',
  templateUrl: './clothes.component.html',
  styleUrls: ['./clothes.component.css']
})
export class ClothesComponent implements OnInit, OnDestroy {
  public listItems: (Jacket | Longwear)[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private clothesService: ClothesService, private cartService: ShoppingCartService) { }

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

    const clothesSubscription = this.clothesService.getClothes().subscribe(clothesObjs => {
      this.loading = false;
      const [jacketsObjs, longwearObjs] = clothesObjs;
      // console.log(jacketsObjs, longwearObjs);      
      const jackets = Object.entries(jacketsObjs).map(jacket => jacket[1]);
      jackets.forEach((jckt, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == jckt._id)) {
          jackets[idx] = {...jackets[idx], buyed: true};
        }
      });
      const longwaer = Object.entries(longwearObjs).map(lngwear => lngwear[1]);
      longwaer.forEach((lngwr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == lngwr._id)) {
          longwaer[idx] = {...longwaer[idx], buyed: true};
        }
      });
      this.listItems = [...this.listItems, ...jackets, ...longwaer];
    });

    this.unsubscriptionArray.push(userSubscription, clothesSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: Jacket | Longwear): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = {...this.listItems[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
