import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderDesktopComponent } from './header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { CategoryModule } from '../category/category.module';
import { CoreRoutingModule } from './core-routing.modules';



@NgModule({
  declarations: [
    HeaderDesktopComponent,
    HeaderMobileComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    SharedModule,
    CategoryModule
  ],
  exports: [HeaderDesktopComponent, HeaderMobileComponent, FooterComponent]
})
export class CoreModule { }
