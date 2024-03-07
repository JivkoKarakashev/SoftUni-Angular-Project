import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderDesktopComponent } from './header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
// import { ShoppingCartDesktopComponent } from '../shared/shopping-cart-desktop/shopping-cart-desktop.component';



@NgModule({
  declarations: [
    HeaderDesktopComponent,
    HeaderMobileComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule, SharedModule
  ],
  exports: [HeaderDesktopComponent, HeaderMobileComponent, FooterComponent]
})
export class CoreModule { }
