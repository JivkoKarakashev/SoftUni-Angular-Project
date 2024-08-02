import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { TuxedosPartywearService } from './tuxedos-partywear.service';
import { Item } from 'src/app/types/item';
import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-tuxedos-partywear',
  templateUrl: './tuxedos-partywear.component.html',
  styleUrls: ['./tuxedos-partywear.component.css']
})
export class TuxedosPartywearComponent {
  public listItems$: TuxedoPartywear[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;


  constructor(private userService: UserService, private tuxedos_partywearService: TuxedosPartywearService, private cartService: ShoppingCartService) { }

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

    const tuxedos_partywearSubscription = this.tuxedos_partywearService.getTuxedosPartywear().subscribe(txds_ptywrObjs => {
      this.loading = false;
      let tuxedos_partywear = Object.entries(txds_ptywrObjs).map(txd_ptywr => txd_ptywr[1]);
      tuxedos_partywear.forEach(txd_ptywr => {
        txd_ptywr.buyed = this.cartItms$$.value.some(itm => itm._id == txd_ptywr._id);
      });
      // console.log(tuxedos_partywear);
      // console.log(tuxedos_partywear instanceof(Array));
      // console.log(tuxedos_partywear[0].buyed);
      // this.listItems$ = Object.values(tuxedos_partywear);
      // console.log(Object.values(tuxedos_partywear));
      this.listItems$ = tuxedos_partywear;
    });

    this.unsubscriptionArray.push(tuxedos_partywearSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: TuxedoPartywear) {
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
