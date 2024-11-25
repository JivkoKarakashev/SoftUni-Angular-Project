import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, Item, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { TiesService } from './ties.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';

@Component({
  selector: 'app-ties',
  templateUrl: './ties.component.html',
  styleUrls: ['./ties.component.css']
})
export class TiesComponent implements OnInit, OnDestroy {

  public listItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private tiesService: TiesService,
    private errorsService: ErrorsService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService
  ) { }

  ngOnInit(): void {
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.cartItms = [...this.cartItms, ...this.cartStateMgmnt.getCartItems()];
    this.cartItemsCounter = this.cartItms.length;
    const tiesSub = this.tiesService.getTies()
      .pipe(
        catchError(err => { return of(err); }),
      )
      .subscribe(res => {
        this.loading = false;
        if (res instanceof HttpErrorResponse) {
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
          return;
        }
        this.listItems = [...this.listItems, ...this.checkForInCartAlready.check([res as Item[]], this.cartItms)];
        // console.log(this.listItems);
      });
    this.unsubscriptionArray.push(tiesSub);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  public addItemtoCart(item: ListItem): void {
    const { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, size, color, brand, quantity, price } = item;
    const newCartItem: CartItem = { _ownerId, _id, _createdOn, image, altImages, cat, subCat, description, brand, size, selectedSize: '', color, selectedColor: '', quantity, selectedQuantity: NaN, price, product: 0, checked: false };
    const idx = this.listItems.findIndex(itm => itm._id == _id);
    this.listItems[idx] = { ...this.listItems[idx], inCart: true };
    this.cartService.addCartItem(newCartItem);
    this.cartItemsCounter++;
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }
}
