import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';

import { HttpError } from 'src/app/types/httpError';

type MyVoid = () => void;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  private unsubscriptionEventsArray: MyVoid[] = [];
  
  public loading = false;
  public httpErrorsArr: HttpError[] = [];
  public activeTab: string | null | 'overview' | 'purchases' | 'sales' = null;

  constructor(
    private render: Renderer2
  ) { }

  @ViewChildren('tabLiElements') private tabLiElements!: QueryList<ElementRef>;
  @ViewChildren('tabAnchorElements') private tabAnchorElements!: QueryList<ElementRef>;

  ngOnInit(): void {
    console.log('Profile Initialized!');
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
      // console.log('UnsubEVENTSArray = 1');
    });
    // console.log('UnsubEVENTSArray = 3');
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
