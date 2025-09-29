import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: 'home',
                loadComponent: () =>
                    import('./home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'clientes',
                loadChildren: () => import('./clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
            }, {
                path: 'produtos',
                loadChildren: () => import('./produtos/produto.route').then(m => m.PRODUTOS_ROUTES)
            }
        ]
    }
];
