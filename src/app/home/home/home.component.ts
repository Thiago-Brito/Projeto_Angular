import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  cards = [
  { link:'', icon: 'person', title: 'Clientes', subtitle: 'Cadastre, edite e visite o cliente' },
  { link:'/paginas/produtos', icon: 'box', title: 'Produtos', subtitle: 'Gerencie catálogo, preços e comissões' },
  { link:'', icon: 'finance_mode', title: 'Relatórios', subtitle: 'Visitas, saldos por período' },
  { link:'', icon: 'settings', title: 'Configurações', subtitle: 'Cidades atendidas, padrões e backup' },
];
}
