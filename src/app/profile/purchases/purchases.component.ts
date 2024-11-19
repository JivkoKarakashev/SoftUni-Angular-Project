import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Subject, Subscription, catchError, switchMap, takeUntil } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';

import { DBOrder } from 'src/app/types/order';
import { UserForAuth } from 'src/app/types/user';

import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { ProfileService } from '../profile.service';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { TradedItem } from 'src/app/types/item';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton, FilterPurchasesDataService } from 'src/app/shared/utils/filter-purchases-data.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  private destroy$$ = new Subject<void>();

  public user: UserForAuth | null = null;
  public dbOrders: DBOrder[] = [];
  public dbOrdersDates: string[] = [];
  public dbTradedItemsArr: Array<TradedItem[]> = [];
  public filterButtons: FilterButton[] = [];

  public filteredOrders: DBOrder[] = [];
  public filteredOrdersDates: string[] = [];
  public filteredTradedItems: Array<TradedItem[]> = [];
  public filteredFilterButtons: FilterButton[] = [];

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileService: ProfileService,
    private numToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private render: Renderer2,
    private filterPurchasesData: FilterPurchasesDataService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    console.log('Purchase Tab Initialized!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : this.user = null;
    if (this.user) {
      const dbOrdersSub = this.profileService.getAlldbOrdersByUserId(this.user._id)
        .pipe(
          takeUntil(this.destroy$$),
          switchMap(dbOrdersArr => {
            if (!dbOrdersArr.length) {
              this.loading = false;
              this.destroy$$.next();
            }
            this.dbOrders = [...this.dbOrders, ...dbOrdersArr];
            dbOrdersArr.forEach((dbOrder, idx) => {
              // this.dbOrders[idx] = { ...this.dbOrders[idx], status: 'pending' };
              this.filterButtons = [...this.filterButtons, { ref: dbOrder.referenceNumber || '', status: this.dbOrders[idx].status, state: 'active' }];
              this.dbOrdersDates = [...this.dbOrdersDates, this.numToDateService.convert(dbOrder._createdOn)];
            });
            this.filteredOrders = [...this.dbOrders];
            this.filteredFilterButtons = [...this.filterButtons];
            this.filteredOrdersDates = [...this.dbOrdersDates];
            return this.profileService.getAllPurchasesByUserOrders([...dbOrdersArr]);
          }),
          takeUntil(this.destroy$$),
          catchError(err => { throw err; })
        )
        .subscribe(
          {
            next: (tradedItemsArr) => {
              // console.log(tradedItemsArr);
              // console.log(this.filterButtons);
              this.loading = false;
              this.dbTradedItemsArr = [...tradedItemsArr];
              this.filteredTradedItems = [...tradedItemsArr];
            },
            error: (err) => {
              this.loading = false;
              this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
              console.log(err);
              console.log(this.httpErrorsArr);
            }
          }
        );
      this.unsubscriptionArray.push(dbOrdersSub)
    }
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  onTextInput(input: string): void {
    const { buttons, dates, orders, tradedItms } = this.filterPurchasesData.filter(input, [...this.filterButtons], [...this.dbOrdersDates], [...this.dbOrders], [...this.dbTradedItemsArr]);
    this.filteredFilterButtons = [...buttons];
    this.filteredOrdersDates = [...dates];
    this.filteredOrders = [...orders];
    this.filteredTradedItems = [...tradedItms];
  }

  onFilterBtnClick(i: number): void {
    // console.log(e.target);
    const fltrBtnEl: HTMLButtonElement = this.buttonFilterElements.toArray()[i].nativeElement;
    (this.filteredFilterButtons[i].state === 'active') ? this.filteredFilterButtons[i].state = 'inactive' : this.filteredFilterButtons[i].state = 'active';
    if (this.filteredFilterButtons[i].state === 'active') {
      this.render.removeClass(fltrBtnEl, 'inactive');
      this.render.addClass(fltrBtnEl, 'active');
    } else if (this.filteredFilterButtons[i].state === 'inactive') {
      this.render.removeClass(fltrBtnEl, 'active');
      this.render.addClass(fltrBtnEl, 'inactive');
    }
    // console.log(this.filterButtons);
  }

  onClearBtnClick() {
    this.inputFilterElement.nativeElement.value = '';
    this.filteredFilterButtons = [...this.filterButtons];
    this.filteredOrdersDates = [...this.dbOrdersDates];
    this.filteredOrders = [...this.dbOrders];
    this.filteredTradedItems = [...this.dbTradedItemsArr];
  }

}
