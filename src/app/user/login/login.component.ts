import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router) {}

  login(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    const { email, pass } = loginForm.value;
    this.userService.login(email, pass).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
