import { Component } from '@angular/core';

import { UserForAuth } from '../types/user';
import { UserStateManagementService } from '../shared/state-management/user-state-management.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent {
  private userData: UserForAuth | null = null;

  constructor(private userStateMgmnt: UserStateManagementService) {
    // console.log(this.userData);
    this.userData = JSON.parse(localStorage.getItem('userData') as string) || null;
    if (this.userData) {
      // console.log(this.userData);      
      this.userStateMgmnt.setUserState(this.userData);
    }
  }
}
