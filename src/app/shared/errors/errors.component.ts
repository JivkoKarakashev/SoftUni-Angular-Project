import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ErrorsService } from './errors.service';
import { CustomError } from './custom-error';
import { UserService } from 'src/app/user/user.service';
import { ShoppingCartStateManagementService } from '../state-management/shopping-cart-state-management.service';
import { OrderStateManagementService } from '../state-management/order-state-management.service';
import { AnimationService } from '../animation-service/animation.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent implements OnInit, OnDestroy {

  public httpErrorsArr: HttpErrorResponse[] = [];
  public customErrorsArr: CustomError[] = [];

  constructor(
    private errorsService: ErrorsService,
    private userService: UserService,
    private cartStateMgmnt: ShoppingCartStateManagementService,
    private orderStateMgmnt: OrderStateManagementService,
    private router: Router,
    private animationService: AnimationService
  ) { }

  ngOnInit(): void {
    // console.log('Error component Initialized!');
    this.httpErrorsArr = this.errorsService.gethttpErrorsArr();
    this.customErrorsArr = this.errorsService.getCustomErrorsArr();
    // this.customErrorsArr.forEach(err => {
    //   const { name, message, isUserError } = err;
    //   console.log('Custom Errors Raised');
    //   console.log('ErrName: ' + name);
    //   console.log('ErrMessage: ' + message);
    //   console.log('IsUserErr: ' + isUserError);
    // });
  }

  ngOnDestroy(): void {
    this.errorsService.resethttpErrorsArrState();
    this.errorsService.resetCustomErrorsArrState();
  }

  logout(): void {
    this.userService.logout()
      .pipe(
        catchError(err => { throw err; })
      ).subscribe(
        () => {
          this.cartStateMgmnt.emptyCart();
          this.orderStateMgmnt.resetDBOrderState();
          this.animationService.disableAllAnimations();
          this.router.navigate(['/auth/login']);
        }
      );
  }

  resignIn(): void {
    this.userService.logout()
      .pipe(
        catchError(err => { return of(err); })
      ).subscribe(
        () => {
          this.animationService.disableAllAnimations();
          this.router.navigate(['/auth/login']);
        }
      );
  }

}

