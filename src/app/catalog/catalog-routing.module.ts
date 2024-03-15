import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { CatalogComponent } from './catalog/catalog.component';

const routes: Routes = [
    {path: 'category', component: CategoryComponent},
    {path: 'catalog', component: CatalogComponent},
    {path: 'catalog/shoes', component: CatalogComponent},
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
