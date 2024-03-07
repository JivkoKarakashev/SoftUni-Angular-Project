import { Component, OnInit } from '@angular/core';
import { desktopModal } from '../../../scripts/desktop-shopping-cart';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {
  ngOnInit(): void {
    desktopModal();
  }
}
