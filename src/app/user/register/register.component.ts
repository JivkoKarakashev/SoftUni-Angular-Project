import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators,  } from '@angular/forms';
import { emailValidator } from 'src/app/shared/utils/email-validator';
import { passwordsValidator } from 'src/app/shared/utils/passwords-validator';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    username: ['', [Validators.required, Validators.minLength(5)]],
    passGroup: this.fb.group(
      {
        pass: ['', [Validators.required, Validators.minLength(6)]],
        rePass: ['', [Validators.required, Validators.minLength(6)]],
      },
      {
        validators: [passwordsValidator()],
      }
    ),
  });

  get passGroup() {
    return this.registerForm.get('passGroup');
  }

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  register(): void {
    // console.log(this.passGroup?.value.rePass);

    if (this.registerForm.invalid) {      
      return;
    }

    const { email, username, passGroup: { pass } = {} } = this.registerForm.value;
    
    this.userService.register(email!, username!, pass!)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
