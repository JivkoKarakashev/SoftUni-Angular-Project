import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Subscription, catchError, switchMap } from 'rxjs';

import { UserStateManagementService } from '../shared/state-management/user-state-management.service';
import { CustomError } from '../shared/errors/custom-error';
import { UserForAuth } from '../types/user';
import { ErrorsService } from '../shared/errors/errors.service';
import { ProfileService } from './profile.service';
import { DBOrder } from '../types/order';
import { TradedItem } from '../types/item';
import { ProfileDataStateManagementService } from '../shared/state-management/profile-data-state-management.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  
  public user: UserForAuth | null = null;

  public orders: DBOrder[] = [];
  public purchasedItems: TradedItem[] = [];
  public soldItems: TradedItem[] = [];

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];
  
  public activeTab: string | null | 'overview' | 'purchases' | 'sales' = null;

  constructor(
    private render: Renderer2,
    private userStateMgmnt: UserStateManagementService,
    private errorsService: ErrorsService,
    private profileService: ProfileService,
    private profileDataStateMgmnt: ProfileDataStateManagementService
  ) { }

  @ViewChildren('tabLiElements') private tabLiElements!: QueryList<ElementRef<HTMLLIElement>>;

  ngOnInit(): void {
    console.log('Profile Initialized!');
    const user = this.userStateMgmnt.getUser();
    try {
      if (user) {
        this.user = { ...user };
      } else {
        const name = 'userError';
        const isUsrErr = true;
        const customError: CustomError = new CustomError(name, 'Please Login or Register to access your Profile!', isUsrErr);
        throw customError;
      }
    } catch (err) {
      this.loading = false;
      const { name, message, isUserError } = err as CustomError;
      this.errorsService.setCustomErrorsArrState([...this.customErrorsArr, { name, message, isUserError }]);
      this.customErrorsArr = [...this.customErrorsArr, { name, message, isUserError }];
    }

    if (this.user) {
      const dbOrdersSub = this.profileService.getAlldbOrdersByUserId(this.user._id)
        .pipe(
          switchMap(dbOrdersArr => {
            if (!dbOrdersArr.length) {
              return EMPTY;
            }
            this.orders = [...this.orders, ...dbOrdersArr];
            this.profileDataStateMgmnt.setOrdersState([...dbOrdersArr]);
            return this.profileService.getAllPurchasesByUserOrders([...dbOrdersArr]);
          }),
          catchError(err => {
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            return EMPTY;
          })
        )
        .subscribe(tradedItemsArr => {
          this.profileDataStateMgmnt.setPurchasedItemsByOrderState([...tradedItemsArr]);
          tradedItemsArr.forEach(trItms => this.purchasedItems.push(...trItms));
        });
      this.unsubscriptionArray.push(dbOrdersSub);

      const dbTradedItemsSub = this.profileService.getAllSalesByUserId(this.user._id)
        .pipe(
          catchError(err => {
            this.loading = false;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            return EMPTY;
          })
        )
        .subscribe(tradedItems => {
          this.loading = false;
          this.soldItems = [...this.soldItems, ...tradedItems];
          this.profileDataStateMgmnt.setSoldItemsState([...tradedItems]);
        });
      this.unsubscriptionArray.push(dbTradedItemsSub);
    }
  }

  ngOnDestroy(): void {
    this.profileDataStateMgmnt.clearProfileDataState();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  // Function to handle tab click and content display
  switchActiveTab(e: Event, activeTab: string) {
    // console.log(e.target);
    const anchorNativeEL = e.target as HTMLAnchorElement;
    // Assign current 'activeTab' title to the 'activeTab' prop when switch between tabs and corresponding section
    // this.activeTab = anchorNativeEL.getAttribute('data-title');
    this.activeTab = activeTab;
    // Add/Remove 'active' class to/from tabs depending on current 'activeTab' selection
    this.tabLiElements.forEach(tabLiEl => {
      const nativeLiEL = tabLiEl.nativeElement;
      nativeLiEL === anchorNativeEL.parentElement ? this.render.addClass(nativeLiEL, 'active') : this.render.removeClass(nativeLiEL, 'active');
    });

  }

}
