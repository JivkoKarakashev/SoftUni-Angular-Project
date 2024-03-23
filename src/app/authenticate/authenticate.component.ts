import { Component, OnInit } from '@angular/core';

import { UserForAuth } from '../types/user';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {
  private userData: UserForAuth;

  constructor( private userService: UserService) {
    // console.log(this.userData);
    this.userData = JSON.parse(localStorage.getItem('userData') as string);    
  }
  
  ngOnInit(): void {
    if (this.userData) {
      // console.log(this.userData);      
      this.userService.setUser = this.userData;
    }
  }

}
