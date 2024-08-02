import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { WaistcoatsService } from './waistcoats.service';
import { Item } from 'src/app/types/item';
import { Waistcoat } from 'src/app/types/waistcoat';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-waistcoats',
  templateUrl: './waistcoats.component.html',
  styleUrls: ['./waistcoats.component.css']
})
export class WaistcoatsComponent {
  public listItems$: Waistcoat[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private waistcoatsService: WaistcoatsService, private cartService: ShoppingCartService) { }

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

    const waistcoatsSubscription = this.waistcoatsService.getWaistcoats().subscribe(wstctsObjs => {
      this.loading = false;
      let waistcoats = Object.entries(wstctsObjs).map(wstct => wstct[1]);
      waistcoats.forEach(wstct => {
        wstct.buyed = this.cartItms$$.value.some(itm => itm._id == wstct._id);
      });
      // console.log(waistcoats);
      // console.log(waistcoats instanceof(Array));
      // console.log(waistcoats[0].buyed);
      // this.listItems$ = Object.values(waistcoats);
      // console.log(Object.values(waistcoats));
      this.listItems$ = waistcoats;
    });

    this.unsubscriptionArray.push(waistcoatsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: Waistcoat) {
    // console.log(e.target);
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price });
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
