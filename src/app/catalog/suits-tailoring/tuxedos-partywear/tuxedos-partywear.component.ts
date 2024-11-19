import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { CartItem, ListItem } from 'src/app/types/item';
import { ShoppingCartService } from 'src/app/shared/shopping-cart/shopping-cart.service';
import { TuxedosPartywearService } from './tuxedos-partywear.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';

import { CheckForItemInCartAlreadyService } from 'src/app/shared/utils/check-for-item-in-cart-already.service';

@Component({
  selector: 'app-tuxedos-partywear',
  templateUrl: './tuxedos-partywear.component.html',
  styleUrls: ['./tuxedos-partywear.component.css']
})
export class TuxedosPartywearComponent implements OnInit, OnDestroy {

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
    private tuxedos_partywearService: TuxedosPartywearService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService
  ) { }

  ngOnInit(): void {
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.cartItms = [...this.cartItms, ...this.cartStateMgmnt.getCartItems()];
    this.cartItemsCounter = this.cartItms.length;
    const tuxedos_partywearSub = this.tuxedos_partywearService.getTuxedosPartywear()
      .pipe(
        catchError(err => { throw err; }),
      )
      .subscribe(
        {
          next: (txds_ptywrObjs) => {
            this.loading = false;
            this.listItems = [...this.listItems, ...this.checkForInCartAlready.check([txds_ptywrObjs], this.cartItms)];
            // console.log(this.listItems);
          },
          error: (err) => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
    this.unsubscriptionArray.push(tuxedos_partywearSub);
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
