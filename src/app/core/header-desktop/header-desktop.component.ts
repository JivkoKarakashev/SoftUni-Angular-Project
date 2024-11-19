import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';
import { UserService } from 'src/app/user/user.service';

import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  
  public user: UserForAuth | null = null;

  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private userService: UserService,
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // desktopModal();
    const userSubscription = this.userStateMgmnt.getUserState().subscribe(userData => {
      (userData) ? this.user = { ...this.user, ...userData } : this.user = null;
    });
    this.unsubscriptionArray.push(userSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
  }

  public logout(): void {
    this.userService.logout().pipe(
      catchError((err) => {
        console.log(err);
        this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
        return of(err);
      })
    ).subscribe(
      {
        next: () => {
          this.cartStateMgmnt.emptyCart();
          this.orderStateMgmnt.resetDBOrderState();
          this.tradedItmsStateMgmnt.resetDBTradedItemsState();
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          console.log(err);
          console.log(this.httpErrorsArr);
        }
      }
    );
  }
}
