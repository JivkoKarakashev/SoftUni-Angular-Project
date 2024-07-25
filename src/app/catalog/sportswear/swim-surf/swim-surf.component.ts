import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SwimSurfService } from './swim-surf.service';
import { Item } from 'src/app/types/item';
import { SwimSurf } from 'src/app/types/swimSurf';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-swim-surf',
  templateUrl: './swim-surf.component.html',
  styleUrls: ['./swim-surf.component.css']
})
export class SwimSurfComponent {
  public listItems$: SwimSurf[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
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
    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    const swim_surfSubscription = this.swim_surfService.getSwimSurf().subscribe(swim_surfObjs => {
      this.loading = false;
      let swim_surf = Object.entries(swim_surfObjs).map(swm_srf => swm_srf[1]);
      swim_surf.forEach(swim_srf => {
        swim_srf.buyed = this.cartItms$$.value.some(itm => itm._id == swim_srf._id);
      });
      // console.log(swim_surf);
      // console.log(swim_surf instanceof(Array));
      // console.log(swim_surf[0].buyed);
      // this.listItems$ = Object.values(swim_surf);
      // console.log(Object.values(swim_surf));
      this.listItems$ = swim_surf;
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

  public addItemtoCart(e: Event, item: SwimSurf) {
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
