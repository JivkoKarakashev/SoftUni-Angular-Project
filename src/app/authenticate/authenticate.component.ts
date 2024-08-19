import { Component } from '@angular/core';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent {

  constructor() {
    if (localStorage.getItem('userData') as string) {
      localStorage.removeItem('userData');
    }
  }
}
