import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { HttpError } from 'src/app/types/httpError';
import { LoggedInOrLoggedOut, loggedInOrLoggedOutInitState } from 'src/app/types/user';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit, OnDestroy {
  public httpError: HttpError = {};
  public loggedInOrLoggedOut: LoggedInOrLoggedOut = loggedInOrLoggedOutInitState;
  private unsubscriptionArray: Subscription[] = [];

  constructor(private userService: UserService, private router: Router, private cartService: ShoppingCartService) { }

  ngOnInit(): void {
    // desktopModal();
    const loggedInOrLoggedOutSubscription = this.userService.loggedInOrLoggedOut$.subscribe(loginInfo => {
      this.loggedInOrLoggedOut = { ...loginInfo };
    });
    this.unsubscriptionArray.push(loggedInOrLoggedOutSubscription);
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
  }

  public logout(): void {
    this.userService.logout().pipe(
      catchError((err) => {
        console.log(err);
        this.httpError = err;
        return of(err);
      })
    ).subscribe((res) => {
      if (res == this.httpError) {
        return;
      }
      this.cartService.emptyCart();
      this.router.navigate(['/auth/login']);
    });
  }
}
