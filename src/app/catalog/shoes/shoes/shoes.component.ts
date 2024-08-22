import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ShoesService } from './shoes.service';
import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { UserForAuth } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';
import { CartItem } from 'src/app/types/cartItem';

@Component({
  selector: 'app-shoes',
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit, OnDestroy {
  public listItems$: (Trainers | Boot | Slippers)[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user$: UserForAuth | null = null;
  public loading: boolean = true;


  constructor(private userService: UserService, private shoesService: ShoesService, private cartService: ShoppingCartService) { }

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  ngOnInit(): void {
    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
      // console.log(this.cartItms$$.value);
    });

    const shoesSubscription = this.shoesService.getShoes().subscribe(shoesObjs => {
      this.loading = false;
      let [trainersObjs, bootsObjs, slippersObjs] = shoesObjs;
      // console.log(trainersObjs, bootsObjs, slippersObjs);
      let trainers = Object.entries(trainersObjs).map(trainers => trainers[1]);
      trainers.forEach((tr, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == tr._id)) {
          trainers[idx] = { ...trainers[idx], buyed: true };
        }
      });
      let boots = Object.entries(bootsObjs).map(boots => boots[1]);
      boots.forEach((bts, idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == bts._id)) {
          boots[idx] = { ...boots[idx], buyed: true };
        }
      });
      let slippers = Object.entries(slippersObjs).map(slippers => slippers[1]);
      slippers.forEach((slps,idx) => {
        if (this.cartItms$$.value.some(itm => itm._id == slps._id)) {
          slippers[idx] = { ...slippers[idx], buyed: true };
        }
      });
      this.listItems$ = [...this.listItems$, ...trainers, ...boots, ...slippers];
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

  public addItemtoCart(item: Trainers | Boot | Slippers) {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, buyed: true, product: 0, checked: false };
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$[idx] = {...this.listItems$[idx], buyed: true};
    this.cartService.addCartItem(newItem);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
