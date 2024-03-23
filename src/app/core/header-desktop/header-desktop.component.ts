import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {

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
    // desktopModal();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['auth/login']);    
  }
}
