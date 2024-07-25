import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BottomsLeggingsService } from './bottoms-leggings.service';
import { Item } from 'src/app/types/item';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-bottoms-leggings',
  templateUrl: './bottoms-leggings.component.html',
  styleUrls: ['./bottoms-leggings.component.css']
})
export class BottomsLeggingsComponent {
  public listItems$: BottomsLeggings[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private bottoms_leggingsService: BottomsLeggingsService, private cartService: ShoppingCartService) { }

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

    const bottoms_leggingsSubscription = this.bottoms_leggingsService.getBottomsLeggings().subscribe(btms_lgingsObjs => {
      this.loading = false;
      let bottoms_leggings = Object.entries(btms_lgingsObjs).map(btm_leg => btm_leg[1]);
      bottoms_leggings.forEach(btm_leg => {
        btm_leg.buyed = this.cartItms$$.value.some(itm => itm._id == btm_leg._id);
      });
      // console.log(bottoms_leggings);
      // console.log(bottoms_leggings instanceof(Array));
      // console.log(bottoms_leggings[0].buyed);
      // this.listItems$ = Object.values(bottoms_leggings);
      // console.log(Object.values(bottoms_leggings));
      this.listItems$ = bottoms_leggings;
    });

    this.unsubscriptionArray.push(bottoms_leggingsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: BottomsLeggings) {
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
