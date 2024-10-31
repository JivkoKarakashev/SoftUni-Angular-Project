import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserForAuth } from 'src/app/types/user';
import { UserService } from '../user.service';

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
  public loading = true;

  constructor(private render: Renderer2, private userService: UserService) { }

  @ViewChildren('tabLiElements') private tabLiElements!: QueryList<ElementRef>;
  @ViewChildren('tabAnchorElements') private tabAnchorElements!: QueryList<ElementRef>;
  @ViewChildren('tabSectionElements') private tabSectionElements!: QueryList<ElementRef>;

  ngOnInit(): void {
    const userSubscription = this.userService.user$.subscribe(userData => {
      this.loading = false;
      if (userData) {
        this.user = { ...this.user, ...userData };
      }
    });
    this.unsubscriptionArray.push(userSubscription);
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
    console.log('UnsubEVENTSArray = 7');
  }

  // Function to handle tab click and content display

  switchActiveTab(e: Event) {
    // console.log(e.target);
    const anchorNativeEL = e.target as HTMLAnchorElement;
    // Add/Remove 'active' class to/from the clicked tab and corresponding section
    // Remove 'active' class from all others tabs and sections
    this.tabLiElements.forEach(tabLiEl => {
      const nativeLiEL = tabLiEl.nativeElement as HTMLLIElement;
      nativeLiEL === anchorNativeEL.parentElement ? this.render.addClass(nativeLiEL, 'active') : this.render.removeClass(nativeLiEL, 'active');
      this.tabSectionElements.forEach(section => {
        const nativeSectionEl = section.nativeElement;
        // console.log(section.classList);
        // console.log(e.target.getAttribute('data-title'));
        nativeSectionEl.classList.contains(anchorNativeEL.getAttribute('data-title')) ? nativeSectionEl.classList.add('active') : nativeSectionEl.classList.remove('active');
      });
    });
  }
}
