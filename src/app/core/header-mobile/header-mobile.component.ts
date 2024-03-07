import { Component, OnInit } from '@angular/core';
import { mobileModal } from 'src/scripts/mobile-shopping-cart';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css']
})
export class HeaderMobileComponent implements OnInit {
  ngOnInit(): void {
    mobileModal();
  }
}
