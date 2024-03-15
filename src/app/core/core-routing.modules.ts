import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShoppingCartDesktopComponent } from '../shared/shopping-cart-desktop/shopping-cart-desktop.component';

const routes: Routes = [
    {path: 'cart', component: ShoppingCartDesktopComponent},    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class CoreRoutingModule { }
  