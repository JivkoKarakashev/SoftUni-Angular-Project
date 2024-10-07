import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { AccessoriesService } from './accessories.service';
import { CapHat } from 'src/app/types/capHat';
import { Belt } from 'src/app/types/belt';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-accessories',
  templateUrl: './accessories.component.html',
  styleUrls: ['./accessories.component.css']
})
export class AccessoriesComponent implements OnInit, OnDestroy {
  public listItems: (CapHat | Belt | Glove | Sunglasses | Watch)[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;
  public loading = true;


  constructor(private userService: UserService, private accessoriesService: AccessoriesService, private cartService: ShoppingCartService) { }

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

    const accessoriesSubscription = this.accessoriesService.getAccessories().subscribe(accessoriesObjs => {
      this.loading = false;
      const [caps_hatsObjs, beltsObjs, glovesObjs, sunglassesObjs, watchesObjs] = accessoriesObjs;
      // console.log(caps_hatsObjs, beltsObjs, glovesObjs, sunglassesObjs, watchesObjs);      
      const caps_hats = Object.entries(caps_hatsObjs).map(cap_hat => cap_hat[1]);
      caps_hats.forEach((cp_ht, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == cp_ht._id)) {
          caps_hats[idx] = { ...caps_hats[idx], buyed: true };
        }
      });
      const belts = Object.entries(beltsObjs).map(belt => belt[1]);
      belts.forEach((blt, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == blt._id)) {
          belts[idx] = { ...belts[idx], buyed: true };
        }
      });
      const gloves = Object.entries(glovesObjs).map(glves => glves[1]);
      gloves.forEach((glv, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == glv._id)) {
          gloves[idx] = { ...gloves[idx], buyed: true };
        }
      });
      const sunglasses = Object.entries(sunglassesObjs).map(snglsses => snglsses[1]);
      sunglasses.forEach(snglsses => {
        if (this.cartItms$$.value.some(itm => itm._id == snglsses._id)) {
          snglsses = { ...snglsses, buyed: true };
        }
      });
      const watches = Object.entries(watchesObjs).map(wtch => wtch[1]);
      watches.forEach((wtch, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == wtch._id)) {
          watches[idx] = { ...watches[idx], buyed: true };
        }
      });
      this.listItems = [...this.listItems, ...caps_hats, ...belts, ...gloves, ...sunglasses, ...watches];
    });

    this.unsubscriptionArray.push(userSubscription, accessoriesSubscription, cartSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 3');      
    });
  }

  public addItemtoCart(item: CapHat | Belt | Glove | Sunglasses | Watch): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, color, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], buyed: true };
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
