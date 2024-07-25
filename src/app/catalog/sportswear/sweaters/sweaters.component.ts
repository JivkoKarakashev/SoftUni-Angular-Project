import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { SweatersService } from './sweaters.service';
import { Item } from 'src/app/types/item';
import { Sweater } from 'src/app/types/sweater';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-sweaters',
  templateUrl: './sweaters.component.html',
  styleUrls: ['./sweaters.component.css']
})
export class SweatersComponent {
  public listItems$: Sweater[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;
  

  constructor(private userService: UserService, private sweatersService: SweatersService, private cartService: ShoppingCartService) { }

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

    const sweatersSubscription = this.sweatersService.getSweaters().subscribe(swtrsObjs => {
      this.loading = false;
      let sweaters = Object.entries(swtrsObjs).map(swtr => swtr[1]);
      sweaters.forEach(swtr => {
        swtr.buyed = this.cartItms$$.value.some(itm => itm._id == swtr._id);
      });
      // console.log(sweaters);
      // console.log(sweaters instanceof(Array));
      // console.log(sweaters[0].buyed);
      // this.listItems$ = Object.values(sweaters);
      // console.log(Object.values(sweaters));
      this.listItems$ = sweaters;
    });

    this.unsubscriptionArray.push(sweatersSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: Sweater) {
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
