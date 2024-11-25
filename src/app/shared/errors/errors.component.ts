import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

import { ErrorsService } from './errors.service';
import { CustomError } from './custom-error';
import { UserService } from 'src/app/user/user.service';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { OrderStateManagementService } from '../state-management/order-state-management.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];

  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  constructor(
    private errorsService: ErrorsService,
    private userService: UserService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Error component Initialized!');
    const errsSub = this.errorsService.gethttpErrorsArrState()
      .pipe(
        switchMap(httpErrs => {
          this.httpErrorsArr = [...httpErrs];
          return this.errorsService.getCustomErrorsArrState();
        }),
      )
      .subscribe(customErrs => {
        this.customErrorsArr = [...this.customErrorsArr, ...customErrs];
      });
    this.unsubscriptionArray.push(errsSub);
    console.log(this.customErrorsArr);
  }

  ngOnDestroy(): void {
    this.errorsService.resethttpErrorsArrState();
    this.errorsService.resetCustomErrorsArrState();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  logout(): void {
    this.userService.logout().pipe(
      catchError(err => { throw err; })
    ).subscribe(
      () => {
        this.cartStateMgmnt.emptyCart();
        this.orderStateMgmnt.resetDBOrderState();
        this.router.navigate(['/auth/login']);
      }
    );
  }

  resignIn(): void {
    this.userService.logout().pipe(
      catchError(err => { return of(err); })
    ).subscribe(
      () => this.router.navigate(['/auth/login'])
    );
  }

}

