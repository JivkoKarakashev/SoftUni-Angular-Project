import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './main/main.component';
import { HomeComponent } from './home/home.component';
import { httpLogoutInterceptorProvider } from './interceptors/http-logout.interceptor';
import { httpAJAXInterceptorProvider } from './interceptors/http-ajax.interceptor';
import { AuthenticateComponent } from './authenticate/authenticate.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ExtractStatesComponent } from './extract-states/extract-states.component';
// import { NgxStripeModule } from 'ngx-stripe';
// import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HomeComponent,
    AuthenticateComponent,
    ExtractStatesComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    CoreModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    SlickCarouselModule,
    // NgxStripeModule.forRoot(environment.stripe.publicKey)
  ],
  providers: [httpLogoutInterceptorProvider, httpAJAXInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
