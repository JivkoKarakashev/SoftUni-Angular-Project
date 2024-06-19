import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { emailValidator } from 'src/app/shared/utils/email-validator';
import { catchError, of } from 'rxjs';
import { HttpError } from 'src/app/types/httpError';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public httpError: HttpError = {};

  loginForm = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],    
    pass: ['', [Validators.required,]],
  });

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {}

  login(): void {
    if (this.loginForm.invalid) {    
      return;
    }
    const { email, pass } = this.loginForm.value;
    this.userService.login(email!, pass!).pipe(
      catchError((err) => {
        // console.log(err);
        this.httpError = err;        
        return of(err);
      })
    ).subscribe((res) => {
      // console.log(res);
      if (res == this.httpError) {
        return;
      }
      this.router.navigate(['/']);
    });
  }
}
