import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { DBOrder } from 'src/app/types/order';
import { TradedItem } from 'src/app/types/item';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton, FilterPurchasesDataService } from 'src/app/shared/utils/filter-purchases-data.service';
import { OrderStatusCheckService } from 'src/app/shared/utils/order-status-check.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {

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
    private orderStatusCheck: OrderStatusCheckService
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
