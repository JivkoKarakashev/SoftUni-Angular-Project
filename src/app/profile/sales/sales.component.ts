import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { EMPTY, Subscription, catchError } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { TradedItem } from 'src/app/types/item';

import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { ProfileService } from '../profile.service';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { FilterButton } from 'src/app/shared/utils/filter-purchases-data.service';
import { FilterSalesDataService } from 'src/app/shared/utils/filter-sales-data.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

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
    private filterSalesData: FilterSalesDataService,
    private errorsService: ErrorsService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    console.log('Sales Tab Initialized!');
    const user = this.userStateMgmnt.getUser();
    try {
      if (user) {
        this.user = { ...user };
      } else {
        throw new Error('Please Login or Register to access your Profile!');
      }
    } catch (err) {
      this.loading = false;
      this.errorsArr.push(err as Error);
      this.errorsService.setErrorsArr([...this.errorsArr]);
    }

    if (this.user) {
      const dbTradedItemsSub = this.profileService.getAllSalesByUserId(this.user._id)
        .pipe(
          catchError(err => {
            console.log('HERE');
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            this.errorsService.sethttpErrorsArr([...this.httpErrorsArr]);
            return EMPTY;
          })
        )
        .subscribe(tradedItems => {
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
        });
      this.unsubscriptionArray.push(dbTradedItemsSub);
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
