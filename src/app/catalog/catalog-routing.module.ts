import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShoesComponent } from './shoes/shoes.component';
import { JacketsComponent } from './jackets/jackets.component';

const routes: Routes = [
    {path: 'catalog/jackets', component: JacketsComponent},
    {path: 'catalog/longwear', component: JacketsComponent},
    {path: 'catalog/shoes', component: ShoesComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
