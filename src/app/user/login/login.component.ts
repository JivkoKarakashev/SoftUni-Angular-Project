import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { emailValidator } from 'src/app/shared/utils/email-validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],    
    pass: ['', [Validators.required,]],
  });

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {}

  login() {
    if (this.loginForm.invalid) {    
      return;
    }
    const { email, pass } = this.loginForm.value;
    this.userService.login(email!, pass!).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
