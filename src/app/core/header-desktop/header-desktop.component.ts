import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';
import { UserService } from 'src/app/user/user.service';

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { AnimationService } from 'src/app/shared/animation-service/animation.service';
import { NgZoneOnStableEventProviderService } from 'src/app/shared/utils/ng-zone-on-stable-event-provider.service';

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
    private errorsService: ErrorsService,
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService,
    private router: Router,
    private animationService: AnimationService,
    private ngZone: NgZone,
    private ngZoneOnStableEventProviderService: NgZoneOnStableEventProviderService
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
    // console.log('UnsubArray = 1');
  }

  public logout(): void {
    this.userService.logout()
      .pipe(
        catchError(err => { return of(err); })
      )
      .subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...res }]);
          this.httpErrorsArr = [...this.httpErrorsArr, { ...res }];
          return;
        }
        this.cartStateMgmnt.emptyCart();
        this.orderStateMgmnt.resetDBOrderState();
        this.tradedItmsStateMgmnt.resetDBTradedItemsState();
        this.animationService.disableAllAnimations();
        this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
          .subscribe(
            () => this.ngZone.run(
              () => this.router.navigate(['/auth/login'])
            )
          );
      });
  }

  onNavigate(e: Event, route: string) {
    e.preventDefault();
    this.animationService.disableAllAnimations()
    this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
      .subscribe(
        () => this.ngZone.run(
          () => this.router.navigate([route])
        )
      );
  }
}
