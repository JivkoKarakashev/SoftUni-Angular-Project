import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SportswearService } from './sportswear.service';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { Gym } from 'src/app/types/gym';
import { Running } from 'src/app/types/running';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { SwimSurf } from 'src/app/types/swimSurf';
import { Outdoors } from 'src/app/types/outdoors';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { Sweater } from 'src/app/types/sweater';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-sportswear',
  templateUrl: './sportswear.component.html',
  styleUrls: ['./sportswear.component.css']
})
export class SportswearComponent implements OnInit, OnDestroy {
  public listItems$: (Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater)[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | null = null;
  public loading: boolean = true;


  constructor(private userService: UserService, private sportswearService: SportswearService, private cartService: ShoppingCartService) { }

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
    
    const sportswearSubscription = this.sportswearService.getSportswear().subscribe(sportswearObjs => {
      this.loading = false;
      let [gymObjs, runningObjs, ski_snowboardObjs, swim_surfObjs, outdoorsObjs, bottoms_leggingsObjs, sweatersObjs] = sportswearObjs;
      // console.log(gymObjs, runningObjs, ski_snowboardObjs, swim_surfObjs, outdoorsObjs, bottoms_leggingsObjs, sweatersObjs);      
      let gym = Object.entries(gymObjs).map(gm => gm[1]);
      gym.forEach((gm, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == gm._id)) {
          gym[idx] = { ...gym[idx], buyed: true };
        }
      });
      let runnings = Object.entries(runningObjs).map(runs => runs[1]);
      runnings.forEach((run, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == run._id)) {
          runnings[idx] = { ...runnings[idx], buyed: true };
        }
      });
      let ski_snowboard = Object.entries(ski_snowboardObjs).map(sk_snwbrd => sk_snwbrd[1]);
      ski_snowboard.forEach((ski_snwbrd, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == ski_snwbrd._id)) {
          ski_snowboard[idx] = { ...ski_snowboard[idx], buyed: true };
        }
      });
      let swim_surf = Object.entries(swim_surfObjs).map(swm_srf => swm_srf[1]);
      swim_surf.forEach((swim_srf, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == swim_srf._id)) {
          swim_surf[idx] = { ...swim_surf[idx], buyed: true };
        }
      });
      let outdoors = Object.entries(outdoorsObjs).map(outdr => outdr[1]);
      outdoors.forEach((outdr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == outdr._id)) {
          outdoors[idx] = { ...outdoors[idx], buyed: true };
        }
      });
      let bottoms_leggings = Object.entries(bottoms_leggingsObjs).map(btm_leg => btm_leg[1]);
      bottoms_leggings.forEach((btm_leg, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == btm_leg._id)) {
          bottoms_leggings[idx] = { ...bottoms_leggings[idx], buyed: true };
        }
      });
      let sweaters = Object.entries(sweatersObjs).map(swtr => swtr[1]);
      sweaters.forEach((swtr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == swtr._id)) {
          sweaters[idx] = { ...sweaters[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$, ...gym, ...runnings, ...ski_snowboard, ...swim_surf, ...outdoors, ...bottoms_leggings, ...sweaters];
    });

    this.unsubscriptionArray.push(sportswearSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(item: Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
