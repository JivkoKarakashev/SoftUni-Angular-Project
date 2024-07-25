import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { RunningService } from './running.service';
import { Item } from 'src/app/types/item';
import { Running } from 'src/app/types/running';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-running',
  templateUrl: './running.component.html',
  styleUrls: ['./running.component.css']
})
export class RunningComponent {
  public listItems$: Running[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | undefined;
  public loading: boolean = true;
  

  constructor(private userService: UserService, private runningService: RunningService, private cartService: ShoppingCartService) { }

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

    const runningSubscription = this.runningService.getRunning().subscribe(runObjs => {
      this.loading = false;
      let running = Object.entries(runObjs).map(run => run[1]);
      running.forEach(run => {
        run.buyed = this.cartItms$$.value.some(itm => itm._id == run._id);
      });
      // console.log(running);
      // console.log(running instanceof(Array));
      // console.log(running[0].buyed);
      // this.listItems$ = Object.values(running);
      // console.log(Object.values(running));
      this.listItems$ = running;
    });

    this.unsubscriptionArray.push(runningSubscription, cartSubscription);

    this.user$ = JSON.parse(localStorage?.getItem('userData') as string);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 2');      
    });
  }

  public addItemtoCart(e: Event, item: Running) {
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
