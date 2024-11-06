import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserService } from '../user.service';
import { DBOrder } from 'src/app/types/order';
import { CartItem } from 'src/app/types/cartItem';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';

type MyVoid = () => void;

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
  public sales: CartItem[] = [];
  public dbOrdersDates: string[] = [];
  public loading = true;
  public activeTab: string | null | 'overview' | 'purchases' | 'sales' = null;

  constructor(private render: Renderer2, private userService: UserService, private numberToDateService: NumberToDateService, public capitalizeCategoryService: CapitalizeCategoryService) { }

  @ViewChildren('tabLiElements') private tabLiElements!: QueryList<ElementRef>;
  @ViewChildren('tabAnchorElements') private tabAnchorElements!: QueryList<ElementRef>;

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      this.loading = false;
      if (userData) {
        this.user = { ...this.user, ...userData };
      }
    });
    this.unsubscriptionArray.push(userSubscription);

    if (!this.user) {
      return;
    }
    // const getAllPurchasesAndSalesSubscription = this.userService.getProfileDataByUserId(this.user?._id).subscribe(profileData => {
    //   // this.dbOrders = [...this.dbOrders, ...ordersData];
    //   console.log(profileData);
    //   const [dbOrders, dbSales] = profileData;
    //   this.dbOrders = [...this.dbOrders, ...dbOrders];
    //   this.sales = [...this.sales, ...dbSales.sales];
    //   console.log(this.dbOrders);
    //   console.log(this.sales);
    //   return;
    //   this.dbOrders.forEach((dbOrder, idx) => {
    //     this.dbOrders[idx] = {...this.dbOrders[idx], status: 'rejected'};
    //     this.dbOrdersDates = [...this.dbOrdersDates, this.numberToDateService.convert(dbOrder._createdOn)];
    //   });
    //   // console.log(this.dbOrdersDates);
    // });
    // this.unsubscriptionArray.push(getAllPurchasesAndSalesSubscription);
  }

  ngAfterViewInit(): void {
    this.tabAnchorElements.forEach(anchorEl => {
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
