import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, catchError, switchMap, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { DestroySubsNotifierService } from 'src/app/shared/utils/destroy-subs-notifier.service';

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
  private destroy$: Subject<void> = new Subject<void>;

  public listItems: ListItem[] = [];
  private cartItms: CartItem[] = [];
  public cartItemsCounter = 0;
  private unsubscriptionArray: Subscription[] = [];
  public user: UserForAuth | null = null;

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private destroySubsNotifier: DestroySubsNotifierService,
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private tuxedos_partywearService: TuxedosPartywearService,
    private checkForInCartAlready: CheckForItemInCartAlreadyService,
    private cartService: ShoppingCartService
  ) { }

  ngOnInit(): void {
    const destroySubscription = this.destroySubsNotifier.getNotifier().subscribe(() => this.destroy$.next());
    this.unsubscriptionArray.push(destroySubscription);

    const tuxedos_partywearSubscription = this.userStateMgmnt.getUserState()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(userData => {
          if (userData) {
            this.user = { ...this.user, ...userData };
          }
          return this.cartStateMgmnt.getCartItemsState();
        }),
        takeUntil(this.destroy$),
        switchMap(itms => {
          this.cartItemsCounter = itms.length;
          this.cartItms = [...this.cartItms, ...itms];
          return this.tuxedos_partywearService.getTuxedosPartywear();
        }),
        takeUntil(this.destroy$),
        catchError(err => { throw err; })
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
    this.unsubscriptionArray.push(tuxedos_partywearSubscription);
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
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
    // console.log(this.listItems);
    // console.log(this.cartItms);
  }
}
