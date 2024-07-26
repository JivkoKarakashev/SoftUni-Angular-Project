import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderDesktopComponent } from './header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { CoreRoutingModule } from './core-routing.modules';
import { CatalogRoutingModule } from '../catalog/catalog-routing.module';
import { ShoesRoutingModule } from '../catalog/shoes/shoes-routing.module';
import { AccessoriesRoutingModule } from '../catalog/accessories/accessories-routing.module';
import { SportswearRoutingModule } from '../catalog/sportswear/sportswear-routing.module';
import { SuitsTailoringRoutingModule } from '../catalog/suits-tailoring/suits-tailoring-routing.module';


@NgModule({
  declarations: [
    HeaderDesktopComponent,
    HeaderMobileComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule,
    CatalogRoutingModule,
    ShoesRoutingModule,
    AccessoriesRoutingModule,
    SportswearRoutingModule,
    SuitsTailoringRoutingModule
  ],
  exports: [HeaderDesktopComponent, HeaderMobileComponent, FooterComponent]
})
export class CoreModule { }
