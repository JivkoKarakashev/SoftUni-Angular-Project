import { Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationEvent } from '@angular/animations';
import { Observable, Subscription, catchError, of, tap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { OrderStateManagementService } from 'src/app/shared/state-management/order-state-management.service';
import { ShoppingCartStateManagementService } from 'src/app/shared/state-management/shopping-cart-state-management.service';
import { TradedItemsStateManagementService } from 'src/app/shared/state-management/traded-items-state-management.service';
import { UserService } from 'src/app/user/user.service';

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { AnimationService } from 'src/app/shared/animation-service/animation.service';
import { mobileNavMenuAnimation } from 'src/app/shared/animation-service/animations/mobile-nav-menu.animation';
import { HeaderMobileService, mobileNavMenuState } from './header-mobile.service';
import { NgZoneOnStableEventProviderService } from 'src/app/shared/utils/ng-zone-on-stable-event-provider.service';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css'],
  animations: [
    mobileNavMenuAnimation
  ]
})
export class HeaderMobileComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public user: UserForAuth | null = null;

  public httpErrorsArr: HttpErrorResponse[] = [];

  public mobileNavMenuState: mobileNavMenuState = 'closed';
  public route = '';
  public activeComponentHeight = 0;
  public scrollerYPos = 0;

  constructor(
    private userService: UserService,
    private errorsService: ErrorsService,
    private userStateMgmnt: UserStateManagementService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private tradedItmsStateMgmnt: TradedItemsStateManagementService,
    private router: Router,
    private animationService: AnimationService,
    private headerMobileService: HeaderMobileService,
    private render: Renderer2,
    private ngZone: NgZone,
    private ngZoneOnStableEventProviderService: NgZoneOnStableEventProviderService
  ) { }

  @ViewChild('closeMenuBtn') closeMenuBtn!: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    const activeComponentHeightSub = this.activeComponentHeightSubscription().subscribe();
    const userSubscription = this.userStateMgmnt.getUserState().subscribe(userData => {
      (userData) ? this.user = { ...this.user, ...userData } : this.user = null;
    });
    const mobileNavMenuStateSub = this.headerMobileService.getMobileNavMenuState().subscribe(mobNavMenuState => {
      this.mobileNavMenuState = mobNavMenuState;
    });
    this.unsubscriptionArray.push(userSubscription, mobileNavMenuStateSub, activeComponentHeightSub);
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
        this.route = '/auth/login';
        this.mobileNavMenuState = 'navigate';
      });
  }

  onNavigate(e: Event, route: string) {
    e.preventDefault();
    this.animationService.disableAllAnimations();
    this.route = route;
    this.mobileNavMenuState = 'navigate';
  }

  onCloseNavMenu() {
    this.headerMobileService.setMobileNavMenuState('closed');
  }

  onNavMenuAnimate(e: AnimationEvent) {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'start') {
      if (e.toState === 'open') {
        this.render.removeClass(e.element, 'closed');
        this.render.addClass(e.element, 'open');
      }
    } else if (e.phaseName === 'done') {
      if (e.toState === 'open') {
        this.setCloseMenuButtonHeight();
      }
      if (e.toState === 'closed' || this.mobileNavMenuState === 'navigate') {
        this.render.removeClass(e.element, 'open');
        this.render.addClass(e.element, 'closed');
      }
      if (this.mobileNavMenuState === 'navigate') {
        this.ngZoneOnStableEventProviderService.ngZoneOnStableEvent()
          .subscribe(
            () => this.ngZone.run(
              () => this.router.navigate([this.route])
            )
          );
      }
    }
  }

  activeComponentHeightSubscription(): Observable<number> {
    return this.headerMobileService.getSiteContainerHeight()
      .pipe(
        tap(siteContainerHeight => {
          // console.log(siteContainerHeight);
          this.activeComponentHeight = siteContainerHeight;
          if (this.mobileNavMenuState === 'open') {
            this.setCloseMenuButtonHeight();
          }
        })
      );

  }

  setCloseMenuButtonHeight(): void {
    this.render.setStyle(this.closeMenuBtn.nativeElement, 'height', `${this.activeComponentHeight}px`);
  }

}
