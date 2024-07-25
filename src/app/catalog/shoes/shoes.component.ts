import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ShoesService } from './shoes.service';
import { Item } from 'src/app/types/item';
import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-shoes',
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit, OnDestroy {
  public listItems$: (Trainers & Boot & Slippers)[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;
  

  constructor( private userService:UserService, private shoesService: ShoesService, private cartService: ShoppingCartService ) { }

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

    const shoesSubscription = this.shoesService.getShoes().subscribe(shoesObjs => {
      this.loading = false;
      let [trainersObjs, bootsObjs, slippersObjs] = shoesObjs;
      // console.log(trainersObjs, bootsObjs, slippersObjs);
      let trainers = Object.entries(trainersObjs).map(trainers => trainers[1]);
      trainers.forEach(tr => {
        tr.buyed = this.cartItms$$.value.some(itm => itm._id == tr._id);
      });
      let boots = Object.entries(bootsObjs).map(boots => boots[1]);
      boots.forEach(bts => {
        bts.buyed = this.cartItms$$.value.some(itm => itm._id == bts._id);
      });
      let slippers = Object.entries(slippersObjs).map(slippers => slippers[1]);
      slippers.forEach(slps => {
        slps.buyed = this.cartItms$$.value.some(itm => itm._id == slps._id);
      });
      // console.log(trainers);
      // console.log(boots);
      // console.log(slippers);
      // console.log(slippers instanceof(Array));
      // console.log(slippers[0].buyed);
      // this.listItems$ = Object.values(slippers);
      // console.log(Object.values(slippers));
      this.listItems$ = trainers.concat(boots, slippers);
    });

    this.unsubscriptionArray.push(shoesSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    }); 
  }

  public addItemtoCart(e: Event, item: Trainers | Boot | Slippers) {
    // console.log(e.target);
    item.buyed = true;
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item );    
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
