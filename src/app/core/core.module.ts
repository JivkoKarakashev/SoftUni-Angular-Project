import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderDesktopComponent } from './header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    HeaderDesktopComponent,
    HeaderMobileComponent,
    FooterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [HeaderDesktopComponent, HeaderMobileComponent, FooterComponent]
})
export class CoreModule { }
