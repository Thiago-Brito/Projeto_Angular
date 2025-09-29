import { Component, inject } from '@angular/core';
import { ClientesService } from '../../../services/clientes.service';
import { Cliente } from '../../../models/cliente';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Card, CardModule } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-clientes-manter',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Card,
    Button,
    InputText,
    TableModule,
    CardModule,
    ToastModule
],
  templateUrl: './clientes-manter.component.html',
  styles: ``
})
export class ClientesManterComponent {

  clientesOrigem: Cliente[] = [];
  clientes: Cliente[] = [];

  selecionados: Cliente[] = [];

  nomeBusca = '';
  loadingDelete = false;

  constructor(private service: ClientesService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.service.obterTodos().subscribe({
      next: (lista) => {
        this.clientesOrigem = lista ?? [];
        this.clientes = [...this.clientesOrigem];
      },error: (err) => {
        console.error('Erro ao carregar clientes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de clientes.'
        });
      }
    });
  }

  filtrar(): void {
  const filtro = (this.nomeBusca || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!filtro) {
    this.clientes = [...this.clientesOrigem];
    return;
  }

  this.clientes = this.clientesOrigem.filter(c =>
    c.nome
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(filtro)
  );
}


  hasAnySelected(): boolean {
    return this.selecionados.length > 0;
  }

  deleteSelected(): void {
    const ids = this.selecionados
      .map((s) => s.id)
      .filter((id) => id !== undefined && id !== null);

    if (ids.length === 0) return;
    if (!confirm(`Excluir ${ids.length} cliente(s)?`)) return;

    this.loadingDelete = true;

    const reqs = ids.map((id) => this.service.deletar(id));
    forkJoin(reqs).subscribe({
      next: () => {
        const toDelete = new Set(ids);
        this.clientesOrigem = this.clientesOrigem.filter((c) => !toDelete.has(c.id as any));
        this.filtrar(); 
        this.selecionados = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Clientes excluídos com sucesso!'
        });
      },
      error: (err) => {
        console.error('Falha ao excluir em lote', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao excluir os clientes selecionados.'
        });
      },
      complete: () => (this.loadingDelete = false),
    });
  }
}
