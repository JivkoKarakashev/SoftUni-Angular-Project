import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';

import { UserForAuth } from 'src/app/types/user';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

import { ProfileDataStateManagementService } from 'src/app/shared/state-management/profile-data-state-management.service';
import { TradedItem } from 'src/app/types/item';
import { NumberToDateService } from 'src/app/shared/utils/number-to-date.service';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { FilterButton } from 'src/app/shared/utils/filter-purchases-data.service';
import { FilterSalesDataService } from 'src/app/shared/utils/filter-sales-data.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  public user: UserForAuth | null = null;
  public dbTradedItems: TradedItem[] = [];
  public dbTradedItemsDates: string[] = [];
  public filterButtons: FilterButton[] = [];

  public filteredTradedItemsDates: string[] = [];
  public filteredTradedItems: TradedItem[] = [];
  public filteredFilterButtons: FilterButton[] = [];

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private profileDataStateMgmnt: ProfileDataStateManagementService,
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
