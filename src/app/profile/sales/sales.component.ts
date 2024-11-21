import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';

import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { ProfileService } from '../profile.service';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { FilterButton } from 'src/app/shared/utils/filter-purchases-data.service';
import { TradedItem } from 'src/app/types/item';
import { UserForAuth } from 'src/app/types/user';
import { FilterSalesDataService } from 'src/app/shared/utils/filter-sales-data.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  private destroy$$ = new Subject<void>();

  public user: UserForAuth | null = null;
  public dbTradedItems: TradedItem[] = [];
  public dbTradedItemsDates: string[] = [];
  public filterButtons: FilterButton[] = [];

  public filteredTradedItemsDates: string[] = [];
  public filteredTradedItems: TradedItem[] = [];
  public filteredFilterButtons: FilterButton[] = [];

  public loading = true;
  public httpErrorsArr: HttpErrorResponse[] = [];
  public errorsArr: Error[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileService: ProfileService,
    private numToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private render: Renderer2,
    private filterSalesData: FilterSalesDataService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    console.log('Sales Tab Initialized!');
    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : this.user = null;
    if (this.user) {
      const dbTradedItemsSub = this.profileService.getAllSalesByUserId(this.user._id)
        .pipe(
          // takeUntil(this.destroy$$),
          catchError(err => { throw err; })
        )
        .subscribe(
          {
            next: (tradedItems) => {
              this.loading = false;
              this.dbTradedItems = [...tradedItems];
              this.filteredTradedItems = [...tradedItems];
              tradedItems.forEach((itm) => {
                const ref = itm._createdOn.toString(16);
                this.filterButtons = [...this.filterButtons, { ref, status: itm.status, state: 'active' }];
                this.dbTradedItemsDates = [...this.dbTradedItemsDates, this.numToDateService.convert(itm._createdOn)];
                // this.dbTradedItemsArr[idx] = { ...itm, status: 'pending' };
                // this.filteredTradedItems[idx] = { ...itm, status: 'pending' };
              });
              this.filteredFilterButtons = [... this.filterButtons];
              this.filteredTradedItemsDates = [...this.dbTradedItemsDates];
              this.filteredTradedItems = [...tradedItems];
            },
            error: (err) => {
              this.loading = false;
              this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
              console.log(err);
              console.log(this.httpErrorsArr);
            }
          }
        );
      this.unsubscriptionArray.push(dbTradedItemsSub);
    } else {
      this.loading = false;
      this.errorsArr.push({ message: 'Please Login or Register to access your Profile!', name: 'User Error' });
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
    const { buttons, dates, tradedItms } = this.filterSalesData.filter(input, [...this.filterButtons], [...this.dbTradedItemsDates], [...this.dbTradedItems]);
    this.filteredFilterButtons = [...buttons];
    this.filteredTradedItemsDates = [...dates];
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
    this.filteredTradedItemsDates = [...this.dbTradedItemsDates];
    this.filteredTradedItems = [...this.dbTradedItems];
  }
}
