import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { BlazersJacketsService } from './blazers-jackets.service';
import { Item } from 'src/app/types/item';
import { BlazerJacket } from 'src/app/types/blazerJacket';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-blazers-jackets',
  templateUrl: './blazers-jackets.component.html',
  styleUrls: ['./blazers-jackets.component.css']
})
export class BlazersJacketsComponent {
  public listItems$: BlazerJacket[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private blazers_jacketsService: BlazersJacketsService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const blazers_jacketsSubscription = this.blazers_jacketsService.getBlazersJackets().subscribe(blzrs_jcktsObjs => {
      this.loading = false;
      let blazers_jackets = Object.entries(blzrs_jcktsObjs).map(blzr_jckt => blzr_jckt[1]);
      blazers_jackets.forEach(blzr_jckt => {
        blzr_jckt.buyed = this.cartItms$$.value.some(itm => itm._id == blzr_jckt._id);
        if (blzr_jckt.buyed) {
          this.buyedItems++;
        }
      });
      // console.log(blazers_jackets);
      // console.log(blazers_jackets instanceof(Array));
      // console.log(blazers_jackets[0].buyed);
      // this.listItems$ = Object.values(blazers_jackets);
      // console.log(Object.values(blazers_jackets));
      this.listItems$ = blazers_jackets;
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
      // console.log(this.cartItms$$.value);
    });

    this.unsubscriptionArray.push(blazers_jacketsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  addItemtoCart(e: Event, item: BlazerJacket) {
    // console.log(e.target);
    const { _ownerId, _id, image, description, size, color, quantity, price } = item;
    item.buyed = true;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item);
    this.cartService.addCartItem({ _ownerId, _id, image, description, size, color, quantity, price });
    this.buyedItems++;
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
