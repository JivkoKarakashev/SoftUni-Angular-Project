import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {
  
  constructor(private cartService: ShoppingCartService) {}
  
  ngOnInit(): void {
    // desktopModal();
  }

}
