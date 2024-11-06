import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs';

import { UserService } from '../user.service';
import { EmailValidaorService } from 'src/app/shared/utils/email-validator.service';
import { HttpError } from 'src/app/types/httpError';
import { UserWithAccountId, initialUserWithAccountId } from 'src/app/types/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public httpErrorsArr: HttpError[] = [];
  public loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, this.emailValidator.validate()]],
    password: ['', [Validators.required,]],
  });

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private emailValidator: EmailValidaorService) { }

  login(): void {
    this.loading = true;
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    if (email && password) {
      let userData: UserWithAccountId = initialUserWithAccountId;
      this.userService.login({ email, password }).pipe(
        switchMap(user => {
          userData = { ...user, _accountId: '' };
          // this.userService.setUser({ _id, accessToken, email, username, address });
          return this.userService.getAlldbOrdersByUserId(user._id);
        }),
        catchError(err => { throw err; })
      ).subscribe(
        {
          next: (idPropsArr) => {
            this.loading = false;
            // console.log(idPropsArr);
            userData = { ...userData, _accountId: idPropsArr[0]._id };
            console.log(userData);
            this.userService.setUser(userData);
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            console.log(err);
          }
        }
      );
    }
  }
}
