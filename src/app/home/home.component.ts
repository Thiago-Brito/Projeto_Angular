import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  cards = [
    { title: 'Clientes', subtitle: 'Cadastre, edite e visite o cliente', icon: 'pi pi-users', link: '/clientes' },
    { title: 'Produtos', subtitle: 'Gerencie catálogo, preços e comissões', icon: 'pi pi-box', link: '/produtos' },
    { title: 'Relatórios', subtitle: 'Visitas, saldos por período', icon: 'pi pi-chart-line', link: '/relatorios' },
    { title: 'Configurações', subtitle: 'Cidades atendidas, padrões e backup', icon: 'pi pi-cog', link: '/config' },
  ];
}
