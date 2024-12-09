import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton, FilterPurchasesDataService } from 'src/app/shared/utils/filter-purchases-data.service';
import { OrderStatusCheckService } from 'src/app/shared/utils/order-status-check.service';
import { ProfileService } from '../profile.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit, OnDestroy {

  private unsubscriptionArray: Subscription[] = [];

  public loading = false;
  public httpErrorsArr: HttpErrorResponse[] = [];

  public user: UserForAuth | null = null;
  public dbOrders: DBOrder[] = [];
  public dbOrdersDates: string[] = [];
  public dbTradedItemsArr: Array<TradedItem[]> = [];
  public filterButtons: FilterButton[] = [];

  public filteredOrders: DBOrder[] = [];
  public filteredOrdersDates: string[] = [];
  public filteredTradedItems: Array<TradedItem[]> = [];
  public filteredFilterButtons: FilterButton[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileDataStateMgmnt: ProfileDataStateManagementService,
    private numToDateService: NumberToDateService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private render: Renderer2,
    private filterPurchasesData: FilterPurchasesDataService,
    private orderStatusCheck: OrderStatusCheckService,
    private profileService: ProfileService,
    private errorsService: ErrorsService
  ) { }

  @ViewChildren('buttonFilterElements') private buttonFilterElements!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('inputFilterElement') private inputFilterElement!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    console.log('Purchase Tab Initialized!');

    const user = this.userStateMgmnt.getUser();
    (user) ? this.user = { ...user } : null;
    this.dbOrders = [...this.profileDataStateMgmnt.getOrders()];
    if (!this.dbOrders.length) {
      return;
    }
    this.dbTradedItemsArr = [...this.profileDataStateMgmnt.getPurchasedItemsByOrder()];
    this.dbTradedItemsArr.forEach((trItms, idx) => {
      const status = this.orderStatusCheck.check(trItms);
      console.log(status);
      this.dbOrders[idx] = { ...this.dbOrders[idx], status };
      this.dbOrdersDates[idx] = this.numToDateService.convert(this.dbOrders[idx]._createdOn);
      this.filterButtons[idx] = { ref: this.dbOrders[idx].referenceNumber || '', status, state: 'active' };
    });
    this.filteredOrders = [...this.dbOrders];
    this.filteredOrdersDates = [...this.dbOrdersDates];
    this.filteredTradedItems = [...this.dbTradedItemsArr];
    this.filteredFilterButtons = [...this.filterButtons];
    // console.log(this.filterButtons)
    // console.log(this.filteredFilterButtons);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      console.log('UnsubArray = 1');
    });
    console.log('UnsubArray = 1');
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

  onConfirmOrderReceipt(i: number): void {
    this.dbOrders[i] = { ...this.dbOrders[i], status: 'delivered' };
    this.filterButtons[i] = { ...this.filterButtons[i], status: 'delivered' };
    const updatedTrItms: TradedItem[] = [];
    this.dbTradedItemsArr[i].forEach((trItm, idx) => {
      updatedTrItms[idx] = { ...trItm, status: 'delivered' };
    });
    this.dbTradedItemsArr[i] = [...updatedTrItms];

    this.filteredFilterButtons[i] = { ...this.filterButtons[i] };
    this.filteredOrders[i] = { ...this.dbOrders[i] };
    this.filteredTradedItems[i] = [...this.dbTradedItemsArr[i]];

    this.profileDataStateMgmnt.setOrdersState([...this.dbOrders]);
    this.profileDataStateMgmnt.setPurchasedItemsByOrderState([...this.dbTradedItemsArr]);
  }

}
