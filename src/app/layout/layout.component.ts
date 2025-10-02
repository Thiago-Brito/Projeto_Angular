import { Component } from '@angular/core';
import { MegaMenuModule } from 'primeng/megamenu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [MegaMenuModule, ToolbarModule, ButtonModule, MenuModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styles: ``
})
export class LayoutComponent {
   items: MenuItem[] | undefined;

   constructor(private auth: AuthService, private router: Router) {}
    ngOnInit() {
        this.items = [
            {
                items: [
                    {
                        label: 'Clientes',
                        icon: 'pi pi-users',
                        routerLink: '/clientes'
                    },
                    {
                        label: 'Produtos',
                        icon: 'pi pi-box',
                        routerLink: '/produtos'
                    },
                    {
                        label: 'Relatórios',
                        icon: 'pi pi-chart-line'
                    },
                    {
                        label: 'Configurações',
                        icon: 'pi pi-cog'
                    },
                    {
                        label:'Sair',
                        icon:'pi pi-sign-out',
                        command: () => this.sair()
                    }
                ]
            }
        ];
    }

    sair() {
    this.auth.logout();
    this.router.navigate(['/login'])            
  }
}
