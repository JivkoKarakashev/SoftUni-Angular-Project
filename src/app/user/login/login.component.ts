import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { UserService } from '../user.service';
import { emailValidator } from 'src/app/shared/utils/email-validator';
import { HttpError } from 'src/app/types/httpError';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public httpError: HttpError = {};
  public loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required,]],
  });

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  login(): void {
    this.loading = true;
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    if (email && password) {
      this.userService.login({email, password}).pipe(
        catchError((err) => {
          // console.log(err);
          this.httpError = err;
          return of(err);
        })
      ).subscribe((res) => {
        // console.log(res);
        this.loading = false;
        if (res == this.httpError) {
          return;
        }
        this.router.navigate(['/']);
      });
    }
  }
}
