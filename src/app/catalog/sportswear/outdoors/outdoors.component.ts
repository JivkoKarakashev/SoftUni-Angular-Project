import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { OutdoorsService } from './outdoors.service';
import { Item } from 'src/app/types/item';
import { Outdoors } from 'src/app/types/outdoors';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-outdoors',
  templateUrl: './outdoors.component.html',
  styleUrls: ['./outdoors.component.css']
})
export class OutdoorsComponent {
  public listItems$: Outdoors[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;
  

  constructor(private userService: UserService, private outdoorsService: OutdoorsService, private cartService: ShoppingCartService) { }

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

    const outdoorsSubscription = this.outdoorsService.getOutdoors().subscribe(outdrsObjs => {
      this.loading = false;
      let outdoors = Object.entries(outdrsObjs).map(outdr => outdr[1]);
      outdoors.forEach(outdr => {
        outdr.buyed = this.cartItms$$.value.some(itm => itm._id == outdr._id);
      });
      // console.log(outdoors);
      // console.log(outdoors instanceof(Array));
      // console.log(outdoors[0].buyed);
      // this.listItems$ = Object.values(outdoors);
      // console.log(Object.values(outdoors));
      this.listItems$ = outdoors;
    });

    this.unsubscriptionArray.push(outdoorsSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: Outdoors) {
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
