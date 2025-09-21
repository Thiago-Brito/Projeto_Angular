import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
   {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path:'',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
      },
      {
        path:'clientes',
        loadChildren: () => import('../clientes/clientes.module').then(m => m.ClientesModule)
      },
      {
        path:'produtos',
        loadChildren: () => import('../produtos/produtos.module').then(m => m.ProdutosModule)
      }
    ]
    },
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
