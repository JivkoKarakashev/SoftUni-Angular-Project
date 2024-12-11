import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { UserStateManagementService } from '../state-management/user-state-management.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private userStateMgmnt: UserStateManagementService,
    private router: Router
  ) { }

  canActivate(): boolean | UrlTree {
    const isLoggedIn = Boolean(this.userStateMgmnt.getUser());
    if (isLoggedIn) {
      return true;
    } else {
      return this.router.parseUrl('/auth/login');
    }
  }
}
