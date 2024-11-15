import { Component } from '@angular/core';
import { FormBuilder, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

import { UserService } from '../user.service';
import { EmailValidaorService } from 'src/app/shared/utils/email-validator.service';
import { PasswordValidatorService } from 'src/app/shared/utils/passwords-validator.service';
import { HttpError } from 'src/app/types/httpError';
import { UserStateManagementService } from 'src/app/shared/state-management/user-state-management.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public httpErrorsArr: HttpError[] = [];
  public loading = false;

  registerForm = this.fb.group({
    email: ['', [Validators.required, this.emailValidator.validate()]],
    username: ['', [Validators.required, Validators.minLength(5)]],
    addressGroup: this.fb.group(
      {
        phone: ['', [Validators.required, Validators.pattern(new RegExp(/^(\+[0-9]{1,})-([0-9]{1,})-([0-9]{5,})$/))]],
        street_building: ['', [Validators.required]],
        city: ['', [Validators.required]],
        region: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
      }
    ),
    passGroup: this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        rePassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      {
        validators: [this.passwordValidator.validate()],
      }
    ),
  });

  get addressGroup() {
    return this.registerForm.get('addressGroup');
  }

  get passGroup() {
    return this.registerForm.get('passGroup');
  }

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private emailValidator: EmailValidaorService, private passwordValidator: PasswordValidatorService, private userStateMgmnt: UserStateManagementService) { }

  register(): void {
    // console.log(this.passGroup?.value.rePass);
    this.loading = true;
    if (this.registerForm.invalid) {
      return;
    }
    const { email, username, addressGroup: { phone, street_building, city, region, postalCode, country } = {}, passGroup: { password } = {} } = this.registerForm.value;
    if (email && username && password && phone && street_building && city && region && postalCode && country) {
      const address = { phone, street_building, city, region, postalCode, country };
      this.userService.register({ email, username, password, address })
        .pipe(
          catchError(err => { throw err; })
        )
        .subscribe(
          {
            next: userData => {
              this.loading = false;
              this.userStateMgmnt.setUserState({ ...userData });
              this.router.navigate(['/']);
            },
            error: err => {
              this.loading = false;
              console.log(err);
              this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            }
          }
        );
    }
  }
}
