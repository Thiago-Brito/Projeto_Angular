import { Routes } from '@angular/router';
import { CategoriaService } from '../services/categoria.service';
import { ProdutoService } from '../services/produto.service';

export const PRODUTOS_ROUTES: Routes = [
  {
    path: '',
    providers: [ProdutoService,CategoriaService],
    loadComponent: () =>
      import('./pages/produtos-manter/produtos-manter.component')
        .then(m => m.ProdutosManterComponent),
  },
  {
    path: 'cadastro',
    providers: [ProdutoService,CategoriaService],
    loadComponent: () =>
      import('./pages/produtos-cadastro/produtos-cadastro.component')
        .then(m => m.ProdutosCadastroComponent),
  },
];
