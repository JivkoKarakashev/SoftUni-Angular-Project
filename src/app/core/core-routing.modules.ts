import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';

import { LoginComponent } from '../user/login/login.component';
import { RegisterComponent } from '../user/register/register.component';
import { ProfileComponent } from '../profile/profile.component';
import { CategoryComponent } from '../category/category.component';
import { ShoppingCartComponent } from '../shared/shopping-cart/shopping-cart.component';

import { AuthGuardService } from '../shared/guards/auth-guard.service';

const routes: Routes = [
    { path: 'auth', loadChildren: () => import('../user/user.module').then(m => m.UserModule) },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'auth/profile', canActivate: mapToCanActivate([AuthGuardService]), loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule), component: ProfileComponent },
    { path: 'category', component: CategoryComponent },
    { path: 'cart', component: ShoppingCartComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoreRoutingModule { }
