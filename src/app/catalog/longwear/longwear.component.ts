import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { LongwearService } from './longwear.service';
import { Item } from 'src/app/types/item';
import { Longwear } from 'src/app/types/longwear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-longwear',
  templateUrl: './longwear.component.html',
  styleUrls: ['./longwear.component.css']
})
export class LongwearComponent implements OnInit, OnDestroy {
  public listItems$: Longwear[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor( private userService:UserService, private longwearService: LongwearService, private cartService: ShoppingCartService ) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const longwearSubscription = this.longwearService.getLongwear().subscribe(longwearObjs => {
      this.loading = false;
      let longwaer = Object.entries(longwearObjs).map(lngwear => lngwear[1]);
      longwaer.forEach(lngwr => {
        lngwr.buyed = this.cartItms$$.value.some(itm => itm._id == lngwr._id);
        if (lngwr.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(longwaer);
      // console.log(longwaer instanceof(Array));
      // console.log(longwaer[0].buyed);
      // this.listItems$ = Object.values(longwaer);
      // console.log(Object.values(longwaer));
      this.listItems$ = longwaer;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(longwearSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    }); 
  }

  addItemtoCart(e: Event, item: Longwear) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item );    
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    this.buyedItems++;
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
