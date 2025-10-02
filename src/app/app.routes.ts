import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from '../auth.guard';

export const routes: Routes = [
    {   path: 'login', 
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) 
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
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
            }, 
            {
                path: 'produtos',
                loadChildren: () => import('./produtos/produto.route').then(m => m.PRODUTOS_ROUTES)
            },
            {
                path:'config',
                loadComponent: () => import('./config/config.component').then(m => m.ConfigComponent)
            }
        ]
    }
];
