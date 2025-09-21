import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManterComponent } from './pages/manter/manter.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'manter',
    pathMatch: 'full'
  },
  {
    path: 'manter',
    component:ManterComponent,
  },
  {
    path:'cadastro',
    component:CadastroComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdutosRoutingModule { }
