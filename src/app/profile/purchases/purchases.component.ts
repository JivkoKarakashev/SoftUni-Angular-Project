import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { EMPTY, Subscription, catchError, switchMap } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';
import { ProfileService } from '../profile.service';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton, FilterPurchasesDataService } from 'src/app/shared/utils/filter-purchases-data.service';
import { OrderStatusCheckService } from 'src/app/shared/utils/order-status-check.service';

import { HttpErrorResponse } from '@angular/common/http';
import { CustomError } from 'src/app/shared/errors/custom-error';
import { ErrorsService } from 'src/app/shared/errors/errors.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

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
  public customErrorsArr: CustomError[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileService: ProfileService,
    private numToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private render: Renderer2,
    private filterPurchasesData: FilterPurchasesDataService,
    private orderStatusCheck: OrderStatusCheckService,
    private errorsService: ErrorsService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    console.log('Purchase Tab Initialized!');

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
              this.loading = false;
              return EMPTY;
            }
            this.dbOrders = [...this.dbOrders, ...dbOrdersArr];
            this.filteredOrders = [...this.dbOrders];
            dbOrdersArr.forEach((dbOrder, idx) => {
              this.filterButtons[idx] = { ref: dbOrder.referenceNumber || '', status: this.dbOrders[idx].status, state: 'active' };
              this.dbOrdersDates[idx] = this.numToDateService.convert(dbOrder._createdOn);
            });
            this.filteredFilterButtons = [...this.filterButtons];
            this.filteredOrdersDates = [...this.dbOrdersDates];
            // console.log(this.filterButtons)
            // console.log(this.filteredFilterButtons);
            return this.profileService.getAllPurchasesByUserOrders([...dbOrdersArr]);
          }),
          catchError(err => {
            console.log('HERE');
            this.loading = false;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            return EMPTY;
          })
        )
        .subscribe(tradedItemsArr => {
          this.loading = false;
          console.log(tradedItemsArr);
          // console.log(this.filterButtons);
          tradedItemsArr.forEach((trItms, idx) => {
            const status = this.orderStatusCheck.check(trItms);
            this.filterButtons[idx] = { ...this.filterButtons[idx], status };
            this.dbOrders[idx] = { ...this.dbOrders[idx], status };
          });
          this.filteredFilterButtons = [...this.filterButtons];
          this.filteredOrders = [...this.dbOrders];
          this.dbTradedItemsArr = [...tradedItemsArr];
          this.filteredTradedItems = [...tradedItemsArr];
        });
      this.unsubscriptionArray.push(dbOrdersSub);
    }
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
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
