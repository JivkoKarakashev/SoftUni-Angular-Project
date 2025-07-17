import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Subscription, forkJoin } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { TradedItem } from 'src/app/types/item';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton } from 'src/app/shared/utils/filter-purchases-data.service';
import { FilterSalesDataService } from 'src/app/shared/utils/filter-sales-data.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { BuildTradedItemsRequestsArrayService } from 'src/app/shared/utils/build-traded-items-requests-array.service';
import { HttpLogoutInterceptorSkipHeader } from 'src/app/interceptors/http-logout.interceptor';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit, OnDestroy {

  private unsubscriptionArray: Subscription[] = [];

  public loading = false;
  public httpErrorsArr: HttpErrorResponse[] = [];

  public user: UserForAuth | null = null;
  public dbTradedItems: TradedItem[] = [];
  public dbTradedItemsDates: string[] = [];
  public filterButtons: FilterButton[] = [];

  public filteredTradedItemsDates: string[] = [];
  public filteredTradedItems: TradedItem[] = [];
  public filteredFilterButtons: FilterButton[] = [];

  public updatedDbTradedItems: TradedItem[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileDataStateMgmnt: ProfileDataStateManagementService,
    private numToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private render: Renderer2,
    private filterSalesData: FilterSalesDataService,
    private buildTradesReqsArr: BuildTradedItemsRequestsArrayService,
    private errorsService: ErrorsService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    // console.log('Sales Tab Initialized!');

    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.dbTradedItems = [...this.profileDataStateMgmnt.getSoldItems()];
    this.dbTradedItems.forEach((itm) => {
      const ref = itm._createdOn.toString(16);
      this.filterButtons = [...this.filterButtons, { ref, status: itm.status, state: 'active' }];
      this.dbTradedItemsDates = [...this.dbTradedItemsDates, this.numToDateService.convert(itm._createdOn)];
      // this.dbTradedItemsArr[idx] = { ...itm, status: 'pending' };
      // this.filteredTradedItems[idx] = { ...itm, status: 'pending' };
    });
    this.filteredTradedItems = [...this.dbTradedItems];
    this.filteredFilterButtons = [... this.filterButtons];
    this.filteredTradedItemsDates = [...this.dbTradedItemsDates];
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

  onClearBtnClick(): void {
    this.inputFilterElement.nativeElement.value = '';
    this.filteredFilterButtons = [...this.filterButtons];
    this.filteredTradedItemsDates = [...this.dbTradedItemsDates];
    this.filteredTradedItems = [...this.dbTradedItems];
  }

  onStatusChange(i: number, status: 'confirmed' | 'rejected' | 'shipped' | 'delivered'): void {
    const itmId = this.dbTradedItems[i]._id;
    const idx = this.updatedDbTradedItems.map(itm => itm._id).indexOf(itmId);
    (idx > -1) ? this.updatedDbTradedItems[idx] = { ...this.updatedDbTradedItems[idx], status } : this.updatedDbTradedItems.push({ ...this.dbTradedItems[i], status });
    this.dbTradedItems[i] = { ...this.dbTradedItems[i], status };
    this.filteredTradedItems[i] = { ...this.filteredTradedItems[i], status };
    this.filterButtons[i] = { ...this.filterButtons[i], status };
    this.filteredFilterButtons[i] = { ...this.filteredFilterButtons[i], status };
  }

  onSaveChanges(): void {
    if (!this.updatedDbTradedItems.length) {
      return;
    }
    this.loading = true;
    const headers = new HttpHeaders().set(HttpLogoutInterceptorSkipHeader, '');
    const updatedTrItmsSubscription = forkJoin([...this.buildTradesReqsArr.buildPutReqs([...this.updatedDbTradedItems], headers)])
      .subscribe(
        {
          next: () => {
            this.loading = false;
            this.updatedDbTradedItems = [];
            this.profileDataStateMgmnt.setSoldItemsState([...this.dbTradedItems]);
          },
          error: (err) => {
            this.loading = false;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
          }
        }
      );
    this.unsubscriptionArray.push(updatedTrItmsSubscription);
  }
}
