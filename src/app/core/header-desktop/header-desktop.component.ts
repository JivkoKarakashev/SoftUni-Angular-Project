import { Component, OnInit } from '@angular/core';
import * as modal from '../../../scripts/shopping-cart.js';

@Component({
  selector: 'app-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrls: ['./header-desktop.component.css']
})
export class HeaderDesktopComponent implements OnInit {
  ngOnInit(): void {
    modal.modal();
  }
}
