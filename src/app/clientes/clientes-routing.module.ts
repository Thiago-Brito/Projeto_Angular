import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManterComponent } from './pages/manter/manter.component';

const routes: Routes = [
   {
      path: '',
      redirectTo: 'manter',
      pathMatch: 'full'
    },
    {
      path: 'manter',
      component:ManterComponent,
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }
