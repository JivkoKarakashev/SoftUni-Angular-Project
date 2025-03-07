import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';

import { UserService } from '../user.service';
import { EmailValidaorService } from 'src/app/shared/utils/email-validator.service';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public httpErrorsArr: HttpErrorResponse[] = [];
  public loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, this.emailValidator.validate()]],
    password: ['', [Validators.required,]],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private emailValidator: EmailValidaorService,
    private userStateMgmnt: UserStateManagementService,
    private errorsService: ErrorsService,
    private toastrMessageHandler: ToastrMessageHandlerService
    ) { }

  login(): void {
    this.loading = true;
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    if (email && password) {
      this.userService.login({ email, password })
        .pipe(
          catchError(err => { throw err; })
        )
        .subscribe(
          {
            next: (userData) => {
              this.loading = false;
              // console.log(userData);
              this.userStateMgmnt.setUserState({ ...userData });
              this.router.navigate(['/']);
            },
            error: (err) => {
              this.loading = false;
              const errMsg: string = err.error.message || err.message;
              this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
              this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
              this.toastrMessageHandler.showError(errMsg);
            }
          }
        );
    }
  }
}
