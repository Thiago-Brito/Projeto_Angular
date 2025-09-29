import { Routes } from '@angular/router';
import { ClientesService } from '../services/clientes.service';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    providers: [ClientesService],
    loadComponent: () =>
      import('./pages/clientes-manter/clientes-manter.component')
        .then(m => m.ClientesManterComponent),
  },
  {
    path: 'cadastro',
    providers: [ClientesService],
    loadComponent: () =>
      import('./pages/clientes-cadastro/clientes-cadastro.component')
        .then(m => m.ClientesCadastroComponent),
  },
];
