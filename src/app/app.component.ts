import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserStateManagementService } from './shared/state-management/user-state-management.service';
import { UserForAuth } from './types/user';
import { HeaderMobileService, mobileNavMenuState } from './core/header-mobile/header-mobile.service';
import { AnimationService } from './shared/animation-service/animation.service';
import { ShoppingCartAnimationState, shoppingCartLeaveAnimation } from './shared/animation-service/animations/shopping-cart.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    shoppingCartLeaveAnimation
  ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'ecommerce-app-Angular-v16';

  private userSub: Subscription;
  public user: UserForAuth | null = null;
  public guest = 'Guest';

  public mobileNavMenuState: mobileNavMenuState = 'closed';
  private siteContainerResizeObserver!: ResizeObserver;
  public shoppingCartAnimationState: ShoppingCartAnimationState = 'none';

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private headerMobileService: HeaderMobileService,
    private ngZone: NgZone,
    private router: Router,
    private animationService: AnimationService,
    private location: Location,
    private render: Renderer2
  ) {
    this.userSub = Subscription.EMPTY;
  }

  @ViewChild('siteContainer') siteContainer!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.userSub = this.userStateMgmnt.getUserState().subscribe(usr => this.user = usr);
    this.animationService.getShoppingCartAnimationState().subscribe(state => this.shoppingCartAnimationState = state);
  }

  ngAfterViewInit(): void {
    this.siteContainerResizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.ngZone.run(() => {
          this.onSiteContainerResize(entry);
        });
      }
    });
    this.siteContainerResizeObserver.observe(this.siteContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    // console.log('UnsubArray = 1');
    this.siteContainerResizeObserver.unobserve(this.siteContainer.nativeElement);
    this.siteContainerResizeObserver.disconnect();
  }

  onNavigate(e: Event, route: string): void {
    e.preventDefault();
    this.animationService.disableAllAnimations();
    this.router.navigate([route]);
  }

  toggleMobileNavMenu() {
    // e.stopPropagation();
    this.headerMobileService.setMobileNavMenuState('open');
  }

  onSiteContainerResize(resizeObserverEntry: ResizeObserverEntry) {
    const newSiteContainerHeight = resizeObserverEntry.contentRect.height;
    // console.log(newSiteContainerHeight);
    this.headerMobileService.setSiteContainerHeight(newSiteContainerHeight);
  }

  onShoppingCartLeaveAnimation(e: AnimationEvent): void {
    // console.log(`Animation Triggered: ${e.triggerName}, Phase: ${e.phaseName}, Time: ${e.totalTime}`);
    // console.log(e);
    // console.log(`${e.fromState} ==> ${e.toState}`);
    if (e.phaseName === 'done' && e.toState === 'leave') {
      const modalEl = e.element.querySelector('.li-modal');
      this.render.setStyle(modalEl, 'opacity', 0);
      this.animationService.setShoppingCartAnimationState('none');
      this.location.back();
    }
  }

}
