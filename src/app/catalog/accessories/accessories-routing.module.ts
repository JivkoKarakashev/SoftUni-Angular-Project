import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessoriesComponent } from './accessories/accessories.component';
import { CapsHatsComponent } from './caps-hats/caps-hats.component';
import { BeltsComponent } from './belts/belts.component';
import { GlovesComponent } from './gloves/gloves.component';
import { SunglassesComponent } from './sunglasses/sunglasses.component';
import { WatchesComponent } from './watches/watches.component';
import { ProductDetailsComponent } from 'src/app/shared/product-details/product-details.component';

const routes: Routes = [
  { path: 'catalog/accessories', loadChildren: () => import('./accessories.module').then(m => m.AccessoriesModule) },
  { path: 'catalog/accessories/accessories', component: AccessoriesComponent },
  { path: 'catalog/accessories/caps_hats', component: CapsHatsComponent },
  { path: 'catalog/accessories/caps_hats/:id', component: ProductDetailsComponent },
  { path: 'catalog/accessories/belts', component: BeltsComponent },
  { path: 'catalog/accessories/belts/:id', component: ProductDetailsComponent },
  { path: 'catalog/accessories/gloves', component: GlovesComponent },
  { path: 'catalog/accessories/gloves/:id', component: ProductDetailsComponent },
  { path: 'catalog/accessories/sunglasses', component: SunglassesComponent },
  { path: 'catalog/accessories/sunglasses/:id', component: ProductDetailsComponent },
  { path: 'catalog/accessories/watches', component: WatchesComponent },
  { path: 'catalog/accessories/watches/:id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessoriesRoutingModule { }
