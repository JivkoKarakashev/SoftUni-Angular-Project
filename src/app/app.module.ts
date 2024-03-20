import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './main/main.component';
import { HttpClientModule } from '@angular/common/http';
import { UserModule } from './user/user.module';
import { CatalogModule } from './catalog/catalog.module';
import { HomeComponent } from './home/home.component';
import { appHttpInterceptorProvider } from './app-http.interceptor';
// import { ShoppingCartDesktopComponent } from './shared/shopping-cart-desktop/shopping-cart-desktop.component';
// import { ShoppingCartMobileComponent } from './shared/shopping-cart-mobile/shopping-cart-mobile.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    UserModule,
    CatalogModule,
    HttpClientModule
  ],
  providers: [appHttpInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
