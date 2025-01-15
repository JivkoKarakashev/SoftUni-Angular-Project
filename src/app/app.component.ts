import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserStateManagementService } from './shared/state-management/user-state-management.service';
import { UserForAuth } from './types/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ecommerce-app-Angular-v16';

  private userSub: Subscription;
  public user: UserForAuth | null = null;
  public guest = 'Guest';

  constructor(private userStateMgmnt: UserStateManagementService) {
    this.userSub = Subscription.EMPTY;
  }

  ngOnInit(): void {
    this.userSub = this.userStateMgmnt.getUserState().subscribe(usr => this.user = usr);
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    // console.log('UnsubArray = 1');
  }
}
