import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';

import { AuthGuardService } from '../shared/guards/auth-guard.service';
import { ProductCreateComponent } from './product-create/product-create.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ColorPickerModule } from 'ngx-color-picker';

const routes: Routes = [
    { path: 'create-product', canActivate: mapToCanActivate([AuthGuardService]), loadChildren: () => import('./catalog-manager.module').then(m => m.CatalogManagerModule), component: ProductCreateComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        NgMultiSelectDropDownModule.forRoot(),
        ColorPickerModule
    ],
    exports: [RouterModule]
})
export class CatalogManagerRoutingModule { }