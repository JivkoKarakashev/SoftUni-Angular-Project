import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SportswearService } from './sportswear.service';
import { Item } from 'src/app/types/item';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { Gym } from 'src/app/types/gym';
import { Running } from 'src/app/types/running';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { SwimSurf } from 'src/app/types/swimSurf';
import { Outdoors } from 'src/app/types/outdoors';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { Sweater } from 'src/app/types/sweater';

@Component({
  selector: 'app-sportswear',
  templateUrl: './sportswear.component.html',
  styleUrls: ['./sportswear.component.css']
})
export class SportswearComponent {
  public listItems$: (Gym & Running & SkiSnowboard & SwimSurf & Outdoors & BottomsLeggings & Sweater)[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private sportswearService: SportswearService, private cartService: ShoppingCartService) { }

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
    
    const sportswearSubscription = this.sportswearService.getSportswear().subscribe(sportswearObjs => {
      this.loading = false;
      let [gymObjs, runningObjs, ski_snowboardObjs, swim_surfObjs, outdoorsObjs, bottoms_leggingsObjs, sweatersObjs] = sportswearObjs;
      // console.log(gymObjs, runningObjs, ski_snowboardObjs, swim_surfObjs, outdoorsObjs, bottoms_leggingsObjs, sweatersObjs);      
      let gym = Object.entries(gymObjs).map(gm => gm[1]);
      gym.forEach(gm => {
        gm.buyed = this.cartItms$$.value.some(itm => itm._id == gm._id);
      });
      let runnings = Object.entries(runningObjs).map(run => run[1]);
      runnings.forEach(run => {
        run.buyed = this.cartItms$$.value.some(itm => itm._id == run._id);
      });
      let ski_snowboard = Object.entries(ski_snowboardObjs).map(sk_snwbrd => sk_snwbrd[1]);
      ski_snowboard.forEach(ski_snwbrd => {
        ski_snwbrd.buyed = this.cartItms$$.value.some(itm => itm._id == ski_snwbrd._id);
      });
      let swim_surf = Object.entries(swim_surfObjs).map(swm_srf => swm_srf[1]);
      swim_surf.forEach(swim_srf => {
        swim_srf.buyed = this.cartItms$$.value.some(itm => itm._id == swim_srf._id);
      });
      let outdoors = Object.entries(outdoorsObjs).map(outdr => outdr[1]);
      outdoors.forEach(outdr => {
        outdr.buyed = this.cartItms$$.value.some(itm => itm._id == outdr._id);
      });
      let bottoms_leggings = Object.entries(bottoms_leggingsObjs).map(btm_leg => btm_leg[1]);
      bottoms_leggings.forEach(btm_leg => {
        btm_leg.buyed = this.cartItms$$.value.some(itm => itm._id == btm_leg._id);
      });
      let sweaters = Object.entries(sweatersObjs).map(swtr => swtr[1]);
      sweaters.forEach(swtr => {
        swtr.buyed = this.cartItms$$.value.some(itm => itm._id == swtr._id);
      });
      // console.log(gym);
      // console.log(runnings);
      // console.log(ski_snowboard);
      // console.log(swim_surf);
      // console.log(outdoors);
      // console.log(bottoms_leggings);
      // console.log(sweaters);
      // console.log(sweaters instanceof(Array));
      // console.log(sweaters[0].buyed);
      // this.listItems$ = Object.values(sweaters);
      // console.log(Object.values(sweaters));
      this.listItems$ = gym.concat(runnings, ski_snowboard, swim_surf, outdoors, bottoms_leggings, sweaters);
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

  public addItemtoCart(e: Event, item: Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater) {
    // console.log(e.target);
    const { _ownerId, _id, image, /*altImages, cat, subCat,*/ description, size, color, brand, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, image, /*altImages, cat, subCat,*/ description, size, color, /*brand,*/ quantity, price });
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
