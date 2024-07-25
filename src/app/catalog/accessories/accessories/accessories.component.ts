import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { AccessoriesService } from './accessories.service';
import { Item } from 'src/app/types/item';
import { CapHat } from 'src/app/types/capHat';
import { Belt } from 'src/app/types/belt';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-accessories',
  templateUrl: './accessories.component.html',
  styleUrls: ['./accessories.component.css']
})
export class AccessoriesComponent implements OnInit, OnDestroy {
  public listItems$: (CapHat & Belt & Glove & Sunglasses & Watch)[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private accessoriesService: AccessoriesService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    const accessoriesSubscription = this.accessoriesService.getAccessories().subscribe(accessoriesObjs => {
      this.loading = false;
      let [caps_hatsObjs, beltsObjs, glovesObjs, sunglassesObjs, watchesObjs] = accessoriesObjs;
      // console.log(caps_hatsObjs, beltsObjs, glovesObjs, sunglassesObjs, watchesObjs);      
      let caps_hats = Object.entries(caps_hatsObjs).map(cap_hat => cap_hat[1]);
      caps_hats.forEach(cp_ht => {
        cp_ht.buyed = this.cartItms$$.value.some(itm => itm._id == cp_ht._id);
      });
      let belts = Object.entries(beltsObjs).map(belt => belt[1]);
      belts.forEach(blt => {
        blt.buyed = this.cartItms$$.value.some(itm => itm._id == blt._id);
      });
      let gloves = Object.entries(glovesObjs).map(glves => glves[1]);
      gloves.forEach(glvs => {
        glvs.buyed = this.cartItms$$.value.some(itm => itm._id == glvs._id);
      });
      let sunglasses = Object.entries(sunglassesObjs).map(snglsses => snglsses[1]);
      sunglasses.forEach(snglsses => {
        snglsses.buyed = this.cartItms$$.value.some(itm => itm._id == snglsses._id);
      });
      let watches = Object.entries(watchesObjs).map(wtch => wtch[1]);
      watches.forEach(wtch => {
        wtch.buyed = this.cartItms$$.value.some(itm => itm._id == wtch._id);
      });
      // console.log(caps_hats);
      // console.log(belts);
      // console.log(gloves);
      // console.log(sunglasses);
      // console.log(watches);
      // console.log(watches instanceof(Array));
      // console.log(watches[0].buyed);
      // this.listItems$ = Object.values(watches);
      // console.log(Object.values(watches));
      this.listItems$ = caps_hats.concat(belts, gloves, sunglasses, watches);
    });

    this.unsubscriptionArray.push(accessoriesSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: CapHat | Belt | Glove | Sunglasses | Watch) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
