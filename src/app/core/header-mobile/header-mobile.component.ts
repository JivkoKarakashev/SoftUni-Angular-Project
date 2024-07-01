import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css']
})
export class HeaderMobileComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private cartService: ShoppingCartService) {}

  get isLoggedIn(): boolean {
    // console.log(this.userService.isLoggedIn);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedIn;
  }

  get isLoggedOut(): boolean {
    // console.log(this.userService.isLoggedOut);
    // console.log(this.userService.user$);    
    return this.userService.isLoggedOut;
  }

  ngOnInit(): void {
    // mobileModal();
  }

  logout() {
    this.cartService.emptyCart();
    this.userService.logout();
    this.router.navigate(['/auth/login']);
  }

}
