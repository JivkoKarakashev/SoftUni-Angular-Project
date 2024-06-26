import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SlippersService } from './slippers.service';
import { Item } from 'src/app/types/item';
import { Slippers } from 'src/app/types/slippers';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-slippers',
  templateUrl: './slippers.component.html',
  styleUrls: ['./slippers.component.css']
})
export class SlippersComponent implements OnInit, OnDestroy {
  public listItems$: Slippers[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor( private userService:UserService, private slippersService: SlippersService, private cartService: ShoppingCartService ) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const slippersSubscription = this.slippersService.getSlippers().subscribe(slprsObjs => {
      this.loading = false;
      let slippers = Object.entries(slprsObjs).map(slprs => slprs[1]);
      slippers.forEach(slprs => slprs.buyed = this.cartItms$$.value.some(itm => itm._id == slprs._id));
      // console.log(slippers);
      // console.log(slippers instanceof(Array));
      // console.log(slippers[0].buyed);
      // this.listItems$ = Object.values(slippers);
      // console.log(Object.values(slippers));
      this.listItems$ = slippers;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(slippersSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    }); 
  }

  addItemtoCart(e: Event, item: Slippers) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item );    
    this.cartService.addCartItem({ _ownerId, _id, image, description, color, quantity, price });      
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
