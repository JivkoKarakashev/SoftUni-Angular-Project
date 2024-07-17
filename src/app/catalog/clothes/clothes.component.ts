import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ClothesService } from './clothes.service';
import { Item } from 'src/app/types/item';
import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-clothes',
  templateUrl: './clothes.component.html',
  styleUrls: ['./clothes.component.css']
})
export class ClothesComponent implements OnInit, OnDestroy {
  public listItems$: (Jacket & Longwear)[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor( private userService:UserService, private clothesService: ClothesService, private cartService: ShoppingCartService ) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const clothesSubscription = this.clothesService.getClothes().subscribe(clothesObjs => {
      this.loading = false;
      let [jacketsObjs, longwearObjs] = clothesObjs;
      // console.log(jacketsObjs, longwearObjs);      
      let jackets = Object.entries(jacketsObjs).map(jacket => jacket[1]);
      jackets.forEach(jckt => {
        jckt.buyed = this.cartItms$$.value.some(itm => itm._id == jckt._id);
        if (jckt.buyed) {
          this.buyedItems++;
        }
      });
      let longwaer = Object.entries(longwearObjs).map(lngwear => lngwear[1]);
      longwaer.forEach(lngwr => {
        lngwr.buyed = this.cartItms$$.value.some(itm => itm._id == lngwr._id);
        if (lngwr.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(jackets);
      // console.log(longwaer);
      // console.log(longwaer instanceof(Array));
      // console.log(longwaer[0].buyed);
      // this.listItems$ = Object.values(longwaer);
      // console.log(Object.values(longwaer));
      this.listItems$ = jackets.concat(longwaer);
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(clothesSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    }); 
  }

  addItemtoCart(e: Event, item: Jacket | Longwear) {
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
