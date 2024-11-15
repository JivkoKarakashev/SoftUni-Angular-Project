import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Subscription, catchError, switchMap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserService } from '../user/user.service';
import { UserStateManagementService } from '../shared/state-management/user-state-management.service';
import { DBOrder } from 'src/app/types/order';
import { TradedItem } from '../types/item';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { HttpError } from 'src/app/types/httpError';
import { ProfileService } from './profile.service';

type MyVoid = () => void;
// interface FilterButtonStatus {
//   status: 'active' | 'inactive'
// }
// const FilterButtonInitialStatus: FilterButtonStatus = {
//   status: 'active'
// }

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  private unsubscriptionEventsArray: MyVoid[] = [];
  public user: UserForAuth | null = null;
  public dbOrders: DBOrder[] = [];
  public dbSales: TradedItem[] = [];
  public dbOrdersDates: string[] = [];
  public dbSalesDates: string[] = [];
  public loading = false;
  public httpErrorsArr: HttpError[] = [];
  public activeTab: string | null | 'overview' | 'purchases' | 'sales' = null;
  // public filterButtonsStatusArr: FilterButtonStatus[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileService: ProfileService,
    private render: Renderer2,
    private numberToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService
  ) { }

  @ViewChildren('tabLiElements') private tabLiElements!: QueryList<ElementRef>;
  @ViewChildren('tabAnchorElements') private tabAnchorElements!: QueryList<ElementRef>;
  // @ViewChildren('divSoldItemElements') private divSoldItemElements!: QueryList<ElementRef>;
  // @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef>;
  // @ViewChildren('sectionSalesElement') private sectionSalesElement!: ElementRef;

  ngOnInit(): void {

    const userSubscription = this.userStateMgmnt.getUserState()
      .pipe(
        switchMap(userData => {
          if (!userData) {
            throw new Error('No User DATA!');
          }
          this.user = { ... this.user, ...userData };
          return this.profileService.getProfileDataByUserId(this.user._id)
        }),
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (profileData) => {
            this.loading = false;
            // console.log(profileData);
            const [dbOrders, soldItems] = profileData;
            this.dbOrders = [...this.dbOrders, ...dbOrders];
            this.dbSales = [...this.dbSales, ...soldItems];
            console.log(this.dbOrders);
            console.log(this.dbSales);
            // return;
            this.dbOrders.forEach((dbOrder, idx) => {
              this.dbOrders[idx] = { ...this.dbOrders[idx], status: 'rejected' };
              this.dbOrdersDates = [...this.dbOrdersDates, this.numberToDateService.convert(dbOrder._createdOn)];
            });
            this.dbSales.forEach((soldItm, idx) => {
              this.dbSales[idx] = { ...this.dbSales[idx], status: 'pending' };
              this.dbSalesDates = [...this.dbSalesDates, this.numberToDateService.convert(soldItm._createdOn)];
            });
            // console.log(this.dbOrdersDates);
          },
          error: err => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
            console.log(this.httpErrorsArr);
          }
        }
      );
    this.unsubscriptionArray.push(userSubscription);
  }

  ngAfterViewInit(): void {
    this.tabAnchorElements.forEach(anchorEl => {
      // console.log(anchorEl);
      const currAnchorElEvent = this.render.listen(anchorEl.nativeElement, 'click', this.switchActiveTab.bind(this));
      this.unsubscriptionEventsArray.push(currAnchorElEvent);
    });
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
    this.unsubscriptionEventsArray.forEach((eventFn) => {
      eventFn();
      console.log('UnsubEVENTSArray = 1');
    });
    console.log('UnsubEVENTSArray = 3');
  }

  // Function to handle tab click and content display
  switchActiveTab(e: Event) {
    // console.log(e.target);
    const anchorNativeEL = e.target as HTMLAnchorElement;
    // Assign current 'activeTab' title to the 'activeTab' prop when switch between tabs and corresponding section
    this.activeTab = anchorNativeEL.getAttribute('data-title');
    // Add/Remove 'active' class to/from tabs depending on current 'activeTab' selection
    this.tabLiElements.forEach(tabLiEl => {
      const nativeLiEL = tabLiEl.nativeElement as HTMLLIElement;
      nativeLiEL === anchorNativeEL.parentElement ? this.render.addClass(nativeLiEL, 'active') : this.render.removeClass(nativeLiEL, 'active');
    });

  }

  onTextInput(input: string): void {
    console.log(input);
  }

}
