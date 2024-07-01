import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BootsService } from './boots.service';
import { Item } from 'src/app/types/item';
import { Boot } from 'src/app/types/boot';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-boots',
  templateUrl: './boots.component.html',
  styleUrls: ['./boots.component.css']
})
export class BootsComponent implements OnInit, OnDestroy {
  public listItems$: Boot[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor( private userService:UserService, private bootsService: BootsService, private cartService: ShoppingCartService ) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const bootsSubscription = this.bootsService.getBoots().subscribe(bootsObjs => {
      this.loading = false;
      let boots = Object.entries(bootsObjs).map(bts => bts[1]);
      boots.forEach(bts => bts.buyed = this.cartItms$$.value.some(itm => itm._id == bts._id));
      // console.log(boots);
      // console.log(boots instanceof(Array));
      // console.log(boots[0].buyed);
      // this.listItems$ = Object.values(boots);
      // console.log(Object.values(boots));
      this.listItems$ = boots;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(bootsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    }); 
  }

  addItemtoCart(e: Event, item: Boot) {
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
