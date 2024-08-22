import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { HttpError } from 'src/app/types/httpError';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {
  public httpError: HttpError = {};

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
    this.userService.logout().pipe(
      catchError((err) => {
        console.log(err);
        this.httpError = err;        
        return of(err);
      })
      ).subscribe((res) => {
        if (res == this.httpError) {
          return;
        }
        this.cartService.emptyCart();
        this.router.navigate(['/auth/login']);        
      });
  }
}
